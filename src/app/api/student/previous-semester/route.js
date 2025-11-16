import { NextResponse } from "next/server";
import connect from "@/lib/mongoose";
import Semester from "@/models/Semester";

// Get previous semester based on current semester from database
export async function GET() {
  try {
    await connect();
    const currentSemester = await Semester.findOne();
    
    if (!currentSemester) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Current semester not found" 
        },
        { status: 404 }
      );
    }

    // Calculate previous semester
    let previousSemester, previousSemesterYear;
    const currentSem = currentSemester.semester.toLowerCase();
    const currentYear = currentSemester.year;

    if (currentSem === "spring") {
      // Previous of Spring is Fall of previous year
      previousSemester = "Fall";
      previousSemesterYear = currentYear - 1;
    } else if (currentSem === "summer") {
      // Previous of Summer is Spring of same year
      previousSemester = "Spring";
      previousSemesterYear = currentYear;
    } else {
      // Previous of Fall is Summer of same year
      previousSemester = "Summer";
      previousSemesterYear = currentYear;
    }

    const previousSemesterString = `${previousSemester} ${previousSemesterYear}`;

    return NextResponse.json(
      { 
        success: true, 
        data: { 
          previousSemester: previousSemesterString,
          currentSemester: `${currentSemester.semester} ${currentSemester.year}`
        } 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching previous semester:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to fetch previous semester",
        error: error.message
      },
      { status: 500 }
    );
  }
}

