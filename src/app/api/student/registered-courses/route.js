import { NextResponse } from "next/server";
import connect from "@/lib/mongoose";
import RegisterCourse from "@/models/RegisterCourse";
import Student from "@/models/Student";
import Semester from "@/models/Semester";
import Section from "@/models/Section";

export async function GET(request) {
  try {
    await connect();
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");
    const semester = searchParams.get("semester"); // Optional: if not provided, use current semester

    if (!studentId) {
      return NextResponse.json(
        { success: false, message: "Student ID is required" },
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

    // Determine which semester to use
    let semesterString;
    if (semester) {
      // Use the provided semester
      semesterString = semester;
    } else {
      // Get current semester if not provided
      const currentSemester = await Semester.findOne();
      if (!currentSemester) {
        return NextResponse.json(
          { success: false, message: "Current semester not found" },
          { status: 404 }
        );
      }
      semesterString = `${currentSemester.semester} ${currentSemester.year}`;
    }

    // Find RegisterCourse for the specified semester
    const registerCourse = await RegisterCourse.findOne({
      student: student._id,
      semester: semesterString,
    }).populate({
      path: "courses.course",
      model: "Course",
      select: "courseCode courseTitle credit courseType",
    });

    if (!registerCourse) {
      return NextResponse.json({
        success: true,
        data: [],
        message: "No courses enrolled for current semester",
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

    // Transform the data to a simpler format
    const enrolledCourses = registerCourse.courses.map((item, index) => {
      const sectionName = sectionMap.get(item.section.toString()) || "N/A";
      return {
        code: item.course.courseCode,
        title: item.course.courseTitle,
        credit: item.course.credit,
        section: sectionName,
        courseType: item.course.courseType,
        teacher: "N/A", // Teacher info not available in current schema - can be added later
      };
    });

    return NextResponse.json({
      success: true,
      data: enrolledCourses,
    });
  } catch (error) {
    console.error("Error fetching registered courses:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch registered courses",
      },
      { status: 500 }
    );
  }
}

