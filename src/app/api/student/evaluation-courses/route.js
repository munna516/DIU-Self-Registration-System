import { NextResponse } from "next/server";
import connect from "@/lib/mongoose";
import RegisterCourse from "@/models/RegisterCourse";
import Student from "@/models/Student";
import Section from "@/models/Section";
import Evaluation from "@/models/Evaluation";
import Course from "@/models/Course";
import mongoose from "mongoose";

export async function GET(request) {
  try {
    await connect();

    const { searchParams } = new URL(request.url);
    const studentIdParam = searchParams.get("studentId");
    const rawSemester = searchParams.get("semester");

    if (!studentIdParam) {
      return NextResponse.json({ success: false, message: "Student ID is required" }, { status: 400 });
    }
    if (!rawSemester) {
      return NextResponse.json({ success: false, message: "Semester is required" }, { status: 400 });
    }

    const semester = String(rawSemester).trim();

    // Find student by campus/roll id (or however you store it)
    const student = await Student.findOne({ studentId: studentIdParam });
    if (!student) {
      return NextResponse.json({ success: false, message: "Student not found" }, { status: 404 });
    }

    // Find the latest RegisterCourse for this student+semester (deterministic)
    let registerCourse = await RegisterCourse.findOne({
      student: student._id,
      semester: semester
    })
      .sort({ _id: -1 }) // latest if duplicates exist
      .populate({
        path: "courses.course",
        model: "Course",
        select: "courseCode courseTitle credit courseType"
      });

    // Defensive: if populate didn't populate (course still ObjectId), manually fetch Course docs
    if (registerCourse && registerCourse.courses && registerCourse.courses.length > 0) {
      const needPopulate = registerCourse.courses.some(c => typeof c.course === "string" || mongoose.isValidObjectId(c.course) && !c.course.courseTitle);
      if (needPopulate) {
        // get all course ids and fetch them in one query
        const courseIds = registerCourse.courses.map(c => c.course.toString());
        const coursesDocs = await Course.find({ _id: { $in: courseIds } }).select("courseCode courseTitle credit courseType").lean();
        const courseById = new Map(coursesDocs.map(cd => [cd._id.toString(), cd]));
        // replace course field with full doc where possible
        registerCourse = registerCourse.toObject ? registerCourse.toObject() : registerCourse;
        registerCourse.courses = registerCourse.courses.map(c => ({
          ...c,
          course: courseById.get(c.course.toString()) || c.course, // keep original if not found
        }));
      } else {
        // ensure plain object for later use
        registerCourse = registerCourse.toObject ? registerCourse.toObject() : registerCourse;
      }
    }

    if (!registerCourse || !registerCourse.courses || registerCourse.courses.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        message: "No courses enrolled for this semester",
      });
    }

    const sectionDocs = await Section.find({ department: student.department }).lean();
    const sectionMap = new Map();
    sectionDocs.forEach((sd) => {
      if (Array.isArray(sd.sections)) {
        sd.sections.forEach((sectionObj) => {
          if (sectionObj && sectionObj._id) sectionMap.set(sectionObj._id.toString(), sectionObj.name || "N/A");
        });
      }
    });

    // Get evaluations for this student/semester
    const evaluations = await Evaluation.find({ student: student._id, semester: semester }).lean();
    const evaluatedCoursesSet = new Set();
    evaluations.forEach((ev) => {
      if (Array.isArray(ev.evaluations)) {
        ev.evaluations.forEach((eitem) => {
          if (eitem && eitem.course) evaluatedCoursesSet.add(eitem.course.toString());
        });
      }
    });

    // Build response array with defensive checks (handles unpopulated course gracefully)
    const coursesForEvaluation = [];
    for (const item of registerCourse.courses) {
      // item.section might be ObjectId or string
      const sectionIdStr = item.section ? item.section.toString() : null;
      const sectionName = sectionIdStr ? (sectionMap.get(sectionIdStr) || "N/A") : "N/A";

      // item.course may be a populated object or an ObjectId string
      const courseObj = item.course && typeof item.course === "object" && item.course._id ? item.course : null;
      const courseId = courseObj ? courseObj._id.toString() : (item.course ? item.course.toString() : null);

      const isSubmitted = courseId ? evaluatedCoursesSet.has(courseId) : false;

      coursesForEvaluation.push({
        id: courseId,
        courseName: courseObj ? courseObj.courseTitle : "Unknown Course",
        courseCode: courseObj ? courseObj.courseCode : "N/A",
        section: sectionName,
        teacherName: "N/A",
        submitted: isSubmitted,
        courseId: courseId,
        sectionId: sectionIdStr,
      });
    }

    return NextResponse.json({ success: true, data: coursesForEvaluation });
  } catch (error) {
    console.error("Error fetching evaluation courses:", error);
    // If it's a CastError (invalid ObjectId somewhere), return a 400
    if (error.name === "CastError") {
      return NextResponse.json({ success: false, message: "Invalid id format" }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: error.message || "Failed to fetch evaluation courses" }, { status: 500 });
  }
}
