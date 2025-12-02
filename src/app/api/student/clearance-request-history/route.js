import { NextResponse } from "next/server";
import connect from "@/lib/mongoose";
import Student from "@/models/Student";
import ClearanceRequest from "@/models/ClearanceRequest";

// Get all clearance requests for a student (all semesters)
export async function GET(request) {
  try {
    await connect();

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");

    if (!studentId) {
      return NextResponse.json(
        { success: false, message: "studentId is required" },
        { status: 400 }
      );
    }

    const student = await Student.findOne({ studentId }).lean();
    if (!student) {
      return NextResponse.json(
        { success: false, message: "Student not found" },
        { status: 404 }
      );
    }

    const requests = await ClearanceRequest.find({ student: student._id })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(
      { success: true, data: requests },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching clearance request history:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch clearance history",
      },
      { status: 500 }
    );
  }
}


