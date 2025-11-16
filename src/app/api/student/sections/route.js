import { NextResponse } from "next/server";
import connect from "@/lib/mongoose";
import Section from "@/models/Section";
import { getStudentTerm } from "@/utils/studentTerm";

export async function GET(request) {
  try {
    await connect();
    const { searchParams } = new URL(request.url);
    const department = searchParams.get("department");
    const studentId = searchParams.get("studentId");

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

    // Calculate student level using getStudentTerm function
    const level = getStudentTerm(studentId);

    // Fetch section based on department and level
    const section = await Section.findOne({
      department: department,
      level: level,
    });

    if (!section) {
      return NextResponse.json(
        {
          success: false,
          message: "No sections found for this department and level",
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

