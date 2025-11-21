import { NextResponse } from "next/server";
import connect from "@/lib/mongoose";
import Student from "@/models/Student";
import Teacher from "@/models/Teacher";
import Course from "@/models/Course";
import RegisterCourse from "@/models/RegisterCourse";
import Semester from "@/models/Semester";
import RegistrationSchedule from "@/models/RegistrationSchedule";

export async function GET(request) {
  try {
    await connect();

    // Fetch all data in parallel for better performance
    const [
      totalStudents,
      totalTeachers,
      totalCourses,
      currentSemester,
      allRegistrationSchedules,
    ] = await Promise.all([
      Student.countDocuments().lean(),
      Teacher.countDocuments().lean(),
      Course.countDocuments().lean(),
      Semester.findOne().lean(),
      RegistrationSchedule.find({ isEnabled: true }).lean(),
    ]);

    // Get current semester string
    const semesterString = currentSemester
      ? `${currentSemester.semester} ${currentSemester.year}`
      : null;

    // Count total registrations for current semester
    let totalRegistrations = 0;
    if (semesterString) {
      totalRegistrations = await RegisterCourse.countDocuments({
        semester: semesterString,
      }).lean();
    }

    // Get teaching evaluation status from semester
    const teachingEvaluationStatus = currentSemester?.evalutionIsOpen
      ? "Enabled"
      : "Disabled";

    // Get department-wise registration counts for pie chart
    // Get all unique departments
    const departments = [
      "CSE",
      "SWE",
      "CIS",
      "EEE",
      "CE",
      "TE",
      "ARC",
      "ICE",
      "LAW",
      "ENG",
      "JMC",
      "BBA",
      "THM",
      "IE",
      "PH",
      "NFE",
      "GEB",
    ];

    // Get registration counts per department for current semester
    // Optimized: Get all students grouped by department, then count registrations
    let departmentRegistrations = [];
    
    if (semesterString) {
      // Get all students with their departments
      const allStudents = await Student.find({})
        .select("_id department")
        .lean();

      // Group students by department
      const studentsByDept = {};
      allStudents.forEach((student) => {
        if (!studentsByDept[student.department]) {
          studentsByDept[student.department] = [];
        }
        studentsByDept[student.department].push(student._id);
      });

      // Get all registrations for current semester
      const allRegistrations = await RegisterCourse.find({
        semester: semesterString,
      })
        .select("student")
        .lean();

      // Create a set of student IDs who have registered
      const registeredStudentIds = new Set(
        allRegistrations.map((reg) => reg.student.toString())
      );

      // Count registrations per department
      departmentRegistrations = departments.map((dept) => {
        const studentIds = studentsByDept[dept] || [];
        const count = studentIds.filter((id) =>
          registeredStudentIds.has(id.toString())
        ).length;
        return { department: dept, count };
      });
    } else {
      // If no semester, return zeros
      departmentRegistrations = departments.map((dept) => ({
        department: dept,
        count: 0,
      }));
    }

    // Filter out departments with 0 registrations and sort by count (descending)
    const filteredDeptRegistrations = departmentRegistrations
      .filter((dept) => dept.count > 0)
      .sort((a, b) => b.count - a.count);

    // Get top 5 departments for the chart (or all if less than 5)
    const topDepartments = filteredDeptRegistrations.slice(0, 5);

    return NextResponse.json({
      success: true,
      data: {
        totalStudents,
        totalTeachers,
        totalCourses,
        totalRegistrations,
        ongoingSemester: semesterString || "N/A",
        teachingEvaluationStatus,
        departmentRegistrations: {
          labels: topDepartments.map((d) => d.department),
          data: topDepartments.map((d) => d.count),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching admin dashboard data:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch dashboard data",
      },
      { status: 500 }
    );
  }
}

