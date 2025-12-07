import { NextResponse } from "next/server";
import connect from "@/lib/mongoose";
import Student from "@/models/Student";
import RegisterCourse from "@/models/RegisterCourse";
import Semester from "@/models/Semester";
import Course from "@/models/Course";

export async function GET(request) {
  try {
    await connect();
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");

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

    // Get current semester
    const currentSemester = await Semester.findOne();
    if (!currentSemester) {
      return NextResponse.json(
        { success: false, message: "Current semester not found" },
        { status: 404 }
      );
    }

    const currentSemesterString = `${currentSemester.semester} ${currentSemester.year}`;

    // Get all RegisterCourse documents for this student
    const allRegisterCourses = await RegisterCourse.find({
      student: student._id,
    })
      .populate({
        path: "courses.course",
        model: "Course",
        select: "courseCode courseTitle credit courseType department level",
      })
      .sort({ semester: -1 }) // Sort by semester descending (newest first)
      .lean();

    // Separate current semester and previous semesters
    const currentSemesterCourses = [];
    const previousSemesterCourses = [];

    allRegisterCourses.forEach((registerCourse) => {
      const isCurrentSemester = registerCourse.semester === currentSemesterString;

      registerCourse.courses.forEach((courseItem) => {
        const courseData = {
          _id: courseItem.course._id.toString(),
          courseCode: courseItem.course.courseCode,
          courseTitle: courseItem.course.courseTitle,
          credit: courseItem.course.credit,
          courseType: courseItem.course.courseType,
          department: courseItem.course.department,
          level: courseItem.course.level,
          status: courseItem.status,
          semester: registerCourse.semester,
          sectionId: courseItem.section.toString(),
        };

        if (isCurrentSemester) {
          currentSemesterCourses.push(courseData);
        } else {
          previousSemesterCourses.push(courseData);
        }
      });
    });

    return NextResponse.json({
      success: true,
      data: {
        student: {
          studentId: student.studentId,
          name: student.name,
          department: student.department,
        },
        currentSemester: currentSemesterString,
        currentSemesterCourses,
        previousSemesterCourses,
      },
    });
  } catch (error) {
    console.error("Error fetching student courses:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch student courses",
      },
      { status: 500 }
    );
  }
}

