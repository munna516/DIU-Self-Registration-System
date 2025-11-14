import { NextResponse } from "next/server";
import connect from "@/lib/mongoose";
import Semester from "@/models/Semester";

// Get current semester (only one record exists)
export async function GET() {
  try {
    await connect();
    let semester = await Semester.findOne();
    if (!semester) {
      // Create default semester if none exists
      const currentYear = new Date().getFullYear();
      semester = await Semester.create({
        semester: "Fall",
        year: currentYear,
      });
    }

    return NextResponse.json(
      { success: true, data: semester },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching semester:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch semester" },
      { status: 500 }
    );
  }
}

// Update the single semester record (creates if doesn't exist)
export async function POST(request) {
  try {
    await connect();
    const body = await request.json();
    const { semester, year } = body || {};

    if (!semester || !year) {
      return NextResponse.json(
        { success: false, message: "Semester and year are required" },
        { status: 400 }
      );
    }

    // Validate semester
    const validSemesters = ["Fall", "Spring", "Summer"];
    if (!validSemesters.includes(semester)) {
      return NextResponse.json(
        { success: false, message: "Invalid semester. Must be Fall, Spring, or Summer" },
        { status: 400 }
      );
    }

    // Validate year
    const yearNum = Number(year);
    if (Number.isNaN(yearNum) || yearNum < 2020 || yearNum > 2100) {
      return NextResponse.json(
        { success: false, message: "Year must be between 2020 and 2100" },
        { status: 400 }
      );
    }

    // Check if semester exists before updating
    const existingSemester = await Semester.findOne();
    const isNew = !existingSemester;

    // Update or create the single semester record
    let updatedSemester;
    if (!existingSemester) {
      // Create if doesn't exist
      updatedSemester = await Semester.create({
        semester,
        year: yearNum,
      });
    } else {
      // Update existing
      existingSemester.semester = semester;
      existingSemester.year = yearNum;
      await existingSemester.save();
      updatedSemester = existingSemester;
    }

    return NextResponse.json(
      { 
        success: true, 
        data: updatedSemester, 
        message: isNew 
          ? "Semester created successfully" 
          : "Semester updated successfully" 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating semester:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update semester" },
      { status: 500 }
    );
  }
}

