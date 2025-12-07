import { NextResponse } from "next/server";
import connect from "@/lib/mongoose";
import Teacher from "@/models/Teacher";
import Student from "@/models/Student";
import RegisterCourse from "@/models/RegisterCourse";
import Semester from "@/models/Semester";
import Course from "@/models/Course";

export async function GET(request) {
  try {
    await connect();
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get("teacherId");

    if (!teacherId) {
      return NextResponse.json(
        { success: false, message: "Teacher ID is required" },
        { status: 400 }
      );
    }

    // Get teacher
    const teacher = await Teacher.findOne({ teacherId });
    if (!teacher) {
      return NextResponse.json(
        { success: false, message: "Teacher not found" },
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

    // Get all students in the teacher's department
    const studentsInDepartment = await Student.find({
      department: teacher.department,
    })
      .select("_id")
      .lean();

    const studentIds = studentsInDepartment.map((s) => s._id);

    // Count total registered students in teacher's department for current semester
    const totalRegisteredStudents = await RegisterCourse.countDocuments({
      student: { $in: studentIds },
      semester: semesterString,
    });

    // Get today's date range (start and end of today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Count today's registrations in teacher's department
    const todaysRegistrations = await RegisterCourse.countDocuments({
      student: { $in: studentIds },
      semester: semesterString,
      registeredAt: {
        $gte: today,
        $lt: tomorrow,
      },
    });

    // Get current semester number (extract from semester string or use a default)
    // Assuming semester format is "Fall 2025" or "Spring 2025"
    // For now, we'll just return the semester string as the value
    const currentSemesterValue = semesterString;

    // Calculate weekly registration overview (last 7 days)
    const weeklyData = [];
    const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    // Get the start of the week (Monday)
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - daysFromMonday);
    startOfWeek.setHours(0, 0, 0, 0);

    // Calculate registrations for each day of the week
    for (let i = 0; i < 7; i++) {
      const dayStart = new Date(startOfWeek);
      dayStart.setDate(startOfWeek.getDate() + i);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayStart.getDate() + 1);

      const count = await RegisterCourse.countDocuments({
        student: { $in: studentIds },
        semester: semesterString,
        registeredAt: {
          $gte: dayStart,
          $lt: dayEnd,
        },
      });

      weeklyData.push(count);
    }

    return NextResponse.json({
      success: true,
      data: {
        totalRegisteredStudents,
        todaysRegistrations,
        currentSemester: currentSemesterValue,
        weeklyRegistrations: {
          labels: dayLabels,
          data: weeklyData,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching teacher dashboard data:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch dashboard data",
      },
      { status: 500 }
    );
  }
}

