import { NextResponse } from "next/server";
import connect from "@/lib/mongoose";
import RegisterCourse from "@/models/RegisterCourse";
import Student from "@/models/Student";
import Course from "@/models/Course";
import Semester from "@/models/Semester";

export async function GET(request) {
  try {
    await connect();
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");
    const prerequisiteCode = searchParams.get("prerequisiteCode");

    if (!studentId) {
      return NextResponse.json(
        { success: false, message: "Student ID is required" },
        { status: 400 }
      );
    }

    if (!prerequisiteCode) {
      return NextResponse.json(
        { success: false, message: "Prerequisite course code is required" },
        { status: 400 }
      );
    }

    const [student, prerequisiteCourse, currentSemester] = await Promise.all([
      Student.findOne({ studentId }).lean(),
      Course.findOne({ courseCode: prerequisiteCode }).lean(),
      Semester.findOne().lean(),
    ]);

    if (!student) {
      return NextResponse.json(
        { success: false, message: "Student not found" },
        { status: 404 }
      );
    }

    if (!prerequisiteCourse) {
      return NextResponse.json({
        success: true,
        data: {
          found: false,
          status: null,
          message: "Prerequisite course not found",
        },
      });
    }

    if (!currentSemester) {
      return NextResponse.json(
        { success: false, message: "Current semester not found" },
        { status: 404 }
      );
    }

    // Calculate previous semester
    let previousSemester, previousSemesterYear;
    const currentSem = currentSemester.semester.toLowerCase();
    const currentYear = currentSemester.year;

    if (currentSem === "spring") {
      previousSemester = "Fall";
      previousSemesterYear = currentYear - 1;
    } else if (currentSem === "summer") {
      previousSemester = "Spring";
      previousSemesterYear = currentYear;
    } else {
      previousSemester = "Summer";
      previousSemesterYear = currentYear;
    }

    const previousSemesterString = `${previousSemester} ${previousSemesterYear}`;

    // Find RegisterCourse for previous semester only
    const previousRegisterCourse = await RegisterCourse.findOne({
      student: student._id,
      semester: previousSemesterString,
    })
      .populate({
        path: "courses.course",
        model: "Course",
        select: "courseCode courseTitle",
      })
      .lean();

    // Check if the prerequisite course was taken in previous semester
    let prerequisiteStatus = null;
    let found = false;

    if (previousRegisterCourse) {
      const courseEntry = previousRegisterCourse.courses.find(
        (c) => c.course && c.course.courseCode === prerequisiteCode
      );

      if (courseEntry) {
        found = true;
        prerequisiteStatus = courseEntry.status; // "enrolled", "completed", or "failed"
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        found,
        status: prerequisiteStatus,
        prerequisiteCode,
        prerequisiteTitle: prerequisiteCourse.courseTitle,
        prerequisiteLevel: prerequisiteCourse.level,
        prerequisiteDepartment: prerequisiteCourse.department,
        prerequisiteCredit: prerequisiteCourse.credit,
        prerequisiteCourseType: prerequisiteCourse.courseType,
        prerequisiteDetails: {
          courseCode: prerequisiteCourse.courseCode,
          courseTitle: prerequisiteCourse.courseTitle,
          level: prerequisiteCourse.level,
          department: prerequisiteCourse.department,
          credit: prerequisiteCourse.credit,
          courseType: prerequisiteCourse.courseType,
          prerequisite: prerequisiteCourse.prerequisite || [],
        },
        message: found
          ? prerequisiteStatus === "completed"
            ? "Prerequisite completed"
            : prerequisiteStatus === "failed"
            ? "Prerequisite failed"
            : "Prerequisite enrolled but not completed"
          : "Prerequisite not found in previous semesters",
      },
    });
  } catch (error) {
    console.error("Error checking prerequisite:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to check prerequisite",
      },
      { status: 500 }
    );
  }
}

