import { NextResponse } from "next/server";
import connect from "@/lib/mongoose";
import ClearanceRequest from "@/models/ClearanceRequest";
import Student from "@/models/Student";
import Semester from "@/models/Semester";

// List clearance requests for current semester with optional filters
export async function GET(request) {
  try {
    await connect();

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId") || "";
    const department = searchParams.get("department") || "";

    // Get current semester string (e.g., "Fall 2025")
    const currentSemester = await Semester.findOne().lean();
    if (!currentSemester) {
      return NextResponse.json(
        { success: true, data: [], message: "No semester configured" },
        { status: 200 }
      );
    }
    const semesterLabel = `${currentSemester.semester} ${currentSemester.year}`;

    const studentFilter = {};
    if (studentId) {
      studentFilter.studentId = studentId;
    }
    if (department) {
      studentFilter.department = department;
    }

    // Find matching students first (if filters are provided)
    let studentIds = [];
    if (studentId || department) {
      const students = await Student.find(studentFilter)
        .select("_id studentId name department batch")
        .lean();
      studentIds = students.map((s) => s._id);
      if (studentIds.length === 0) {
        return NextResponse.json(
          { success: true, data: [] },
          { status: 200 }
        );
      }
    }

    const query = { semester: semesterLabel };
    if (studentIds.length > 0) {
      query.student = { $in: studentIds };
    }

    const requests = await ClearanceRequest.find(query)
      .populate({
        path: "student",
        select: "studentId name department batch",
        model: Student,
      })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(
      { success: true, data: requests, semester: semesterLabel },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching clearance requests:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch clearance requests",
      },
      { status: 500 }
    );
  }
}

// Update clearance request status (approve / reject)
export async function PUT(request) {
  try {
    await connect();
    const body = await request.json();
    const { id, status } = body || {};

    if (!id || !status || !["approved", "rejected", "pending"].includes(status)) {
      return NextResponse.json(
        { success: false, message: "Invalid id or status" },
        { status: 400 }
      );
    }

    const updated = await ClearanceRequest.findByIdAndUpdate(
      id,
      { requestStatus: status },
      { new: true }
    )
      .populate({
        path: "student",
        select: "studentId name department batch",
        model: Student,
      })
      .lean();

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Clearance request not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: updated, message: "Status updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating clearance request:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to update clearance request",
      },
      { status: 500 }
    );
  }
}


