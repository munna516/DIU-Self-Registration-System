import { NextResponse } from "next/server";
import connect from "@/lib/mongoose";
import Section from "@/models/Section";
import { getStudentTerm } from "@/utils/studentTerm";
import Semester from "@/models/Semester";

export async function GET(request) {
  try {
    await connect();
    const { searchParams } = new URL(request.url);
    const department = searchParams.get("department");
    const studentId = searchParams.get("studentId");
    const sectionType = searchParams.get("sectionType") || "regular"; // Default to regular

    if (!department) {
      return NextResponse.json(
        { success: false, message: "Department is required" },
        { status: 400 }
      );
    }

    if (!studentId) {
      return NextResponse.json(
        { success: false, message: "Student ID is required" },
        { status: 400 }
      );
    }

    // Validate sectionType
    if (sectionType && !["regular", "retake"].includes(sectionType)) {
      return NextResponse.json(
        { success: false, message: "Invalid section type. Must be 'regular' or 'retake'" },
        { status: 400 }
      );
    }

    const semester = await Semester.findOne();
    // Calculate student level using getStudentTerm function
    const level = getStudentTerm(studentId, {
      semester: semester.semester,
      year: semester.year,
    });

    // Fetch section based on department, level, and sectionType
    // Use lean() for read-only operations to improve performance
    const section = await Section.findOne({
      department: department,
      level: level,
      sectionType: sectionType,
    })
      .select("count")
      .lean();

    if (!section) {
      return NextResponse.json(
        {
          success: false,
          message: `No ${sectionType} sections found for this department and level`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: section,
    });
  } catch (error) {
    console.error("Error fetching sections:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch sections",
      },
      { status: 500 }
    );
  }
}
