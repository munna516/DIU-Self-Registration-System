import { NextResponse } from "next/server";
import connect from "@/lib/mongoose";
import Student from "@/models/Student";
import RegisterCourse from "@/models/RegisterCourse";
import Semester from "@/models/Semester";
import RegistrationSchedule from "@/models/RegistrationSchedule";
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

    const semesterString = `${currentSemester.semester} ${currentSemester.year}`;

    // Find RegisterCourse for current semester
    const registerCourse = await RegisterCourse.findOne({
      student: student._id,
      semester: semesterString,
    }).populate({
      path: "courses.course",
      model: "Course",
      select: "courseCode courseTitle credit courseType",
    });

    // Calculate registered courses count and total credits
    let registeredCoursesCount = 0;
    let totalCredits = 0;
    const coursesData = [];

    if (registerCourse && registerCourse.courses) {
      registeredCoursesCount = registerCourse.courses.length;
      
      registerCourse.courses.forEach((item) => {
        if (item.course && item.course.credit) {
          totalCredits += item.course.credit;
          coursesData.push({
            code: item.course.courseCode,
            title: item.course.courseTitle,
            credit: item.course.credit,
          });
        }
      });
    }

    // Get registration schedule for deadline
    const registrationSchedule = await RegistrationSchedule.findOne({
      department: student.department,
    });

    let deadline = null;
    let registrationStatus = null;
    let registrationStartDate = null;
    let registrationEndDate = null;

    if (registrationSchedule) {
      if (registrationSchedule.endDate) {
        // Format deadline as YYYY-MM-DD
        const endDate = new Date(registrationSchedule.endDate);
        deadline = endDate.toISOString().split("T")[0];
      }

      // Calculate registration status
      if (!registrationSchedule.isEnabled) {
        registrationStatus = "notOpen";
      } else {
        const now = new Date();

        // Get start date and time
        const startDate = new Date(registrationSchedule.startDate);
        const [startHours, startMinutes] = registrationSchedule.startTime
          .split(":")
          .map(Number);
        const registrationStartDateTime = new Date(startDate);
        registrationStartDateTime.setHours(startHours, startMinutes, 0, 0);

        // Get end date and time
        const endDate = new Date(registrationSchedule.endDate);
        const [endHours, endMinutes] = registrationSchedule.endTime
          .split(":")
          .map(Number);
        const registrationEndDateTime = new Date(endDate);
        registrationEndDateTime.setHours(endHours, endMinutes, 0, 0);

        // Check registration status
        if (now < registrationStartDateTime) {
          registrationStatus = "notOpen";
          registrationStartDate = registrationSchedule.startDate;
        } else if (now >= registrationStartDateTime && now <= registrationEndDateTime) {
          registrationStatus = "open";
          registrationEndDate = registrationSchedule.endDate;
        } else {
          registrationStatus = "closed";
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        registeredCourses: registeredCoursesCount,
        totalCredits: totalCredits,
        semester: semesterString,
        deadline: deadline,
        courses: coursesData, // For bar chart
        registrationStatus: registrationStatus,
        registrationStartDate: registrationStartDate,
        registrationEndDate: registrationEndDate,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch dashboard data",
      },
      { status: 500 }
    );
  }
}

