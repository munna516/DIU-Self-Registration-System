import { NextResponse } from "next/server";
import connect from "@/lib/mongoose";
import RegisterCourse from "@/models/RegisterCourse";
import Student from "@/models/Student";
import Section from "@/models/Section";
import Evaluation from "@/models/Evaluation";

// Get courses for teaching evaluation (previous semester courses)
export async function GET(request) {
  try {
    await connect();
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");
    const semester = searchParams.get("semester"); // Previous semester

    if (!studentId) {
      return NextResponse.json(
        { success: false, message: "Student ID is required" },
        { status: 400 }
      );
    }

    if (!semester) {
      return NextResponse.json(
        { success: false, message: "Semester is required" },
        { status: 400 }
      );
    }

    // Get student
    const student = await Student.findOne({ studentId });
    if (!student) {
      return NextResponse.json(
        { success: false, message: "Student not found" },
        { status: 404 }
      );
    }

    // Find RegisterCourse for the previous semester
    const registerCourse = await RegisterCourse.findOne({
      student: student._id,
      semester: semester,
    }).populate({
      path: "courses.course",
      model: "Course",
      select: "courseCode courseTitle credit courseType",
    });

    if (!registerCourse || !registerCourse.courses || registerCourse.courses.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        message: "No courses enrolled for this semester",
      });
    }

    // Get all Section documents to find section names
    const sectionDocs = await Section.find({
      department: student.department,
    });

    // Create a map of section _id to section name
    const sectionMap = new Map();
    sectionDocs.forEach((sectionDoc) => {
      sectionDoc.sections.forEach((sectionObj) => {
        sectionMap.set(sectionObj._id.toString(), sectionObj.name);
      });
    });

    // Get all evaluations for this student and semester to check which courses have been evaluated
    const evaluations = await Evaluation.find({
      student: student._id,
      semester: semester,
    });

    // Create a map of evaluated courses (courseId -> true)
    const evaluatedCoursesMap = new Map();
    evaluations.forEach((evaluation) => {
      evaluation.evaluations.forEach((evalItem) => {
        evaluatedCoursesMap.set(evalItem.course.toString(), true);
      });
    });

    // Transform the data to include evaluation status
    const coursesForEvaluation = registerCourse.courses.map((item) => {
      const sectionName = sectionMap.get(item.section.toString()) || "N/A";
      const courseId = item.course._id.toString();
      const isSubmitted = evaluatedCoursesMap.has(courseId);

      return {
        id: courseId,
        courseName: item.course.courseTitle,
        courseCode: item.course.courseCode,
        section: sectionName,
        teacherName: "N/A", // Teacher info not available in current schema - can be added later
        submitted: isSubmitted,
        courseId: courseId,
        sectionId: item.section.toString(),
      };
    });

    return NextResponse.json({
      success: true,
      data: coursesForEvaluation,
    });
  } catch (error) {
    console.error("Error fetching evaluation courses:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch evaluation courses",
      },
      { status: 500 }
    );
  }
}

