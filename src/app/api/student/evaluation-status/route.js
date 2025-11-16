import { NextResponse } from "next/server";
import connect from "@/lib/mongoose";
import Semester from "@/models/Semester";

// Get evaluation status (student-accessible)
export async function GET() {
  try {
    await connect();
    const semester = await Semester.findOne();
    
    if (!semester) {
      // If no semester exists, evaluation is disabled by default
      return NextResponse.json(
        { 
          success: true, 
          data: { evalutionIsOpen: false } 
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { 
        success: true, 
        data: { evalutionIsOpen: semester.evalutionIsOpen || false } 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching evaluation status:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to fetch evaluation status",
        data: { evalutionIsOpen: false }
      },
      { status: 500 }
    );
  }
}

