import { NextResponse } from "next/server";
import connect from "@/lib/mongoose";
import Student from "@/models/Student";
import ClearanceRequest from "@/models/ClearanceRequest";

// Get clearance request for a student & semester
export async function GET(request) {
    try {
        await connect();

        const { searchParams } = new URL(request.url);
        const studentId = searchParams.get("studentId");
        const semester = searchParams.get("semester");

        if (!studentId || !semester) {
            return NextResponse.json(
                { success: false, message: "Missing required query params" },
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

        const requestDoc = await ClearanceRequest.findOne({
            student: student._id,
            semester,
        }).lean();

        return NextResponse.json(
            {
                success: true,
                data: requestDoc || null,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error fetching clearance request:", error);
        return NextResponse.json(
            {
                success: false,
                message: error.message || "Failed to fetch clearance request",
            },
            { status: 500 }
        );
    }
}

// Create a new clearance request
export async function POST(request) {
    try {
        await connect();
        const body = await request.json();
        const { studentId, department, semester } = body;

        if (!studentId || !department || !semester) {
            return NextResponse.json(
                { success: false, message: "Missing required fields" },
                { status: 400 }
            );
        }

        const student = await Student.findOne({ studentId });
        if (!student) {
            return NextResponse.json(
                { success: false, message: "Student not found" },
                { status: 404 }
            );
        }

        // Check if a request already exists for this student & semester
        const existing = await ClearanceRequest.findOne({
            student: student._id,
            semester,
        });

        if (existing) {
            return NextResponse.json(
                {
                    success: true,
                    message: "Clearance request already exists",
                    data: existing,
                },
                { status: 200 }
            );
        }

        const newRequest = new ClearanceRequest({
            student: student._id,
            department,
            semester,
        });

        await newRequest.save();

        return NextResponse.json(
            {
                success: true,
                message: "Clearance request submitted successfully",
                data: newRequest,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error creating clearance request:", error);
        return NextResponse.json(
            {
                success: false,
                message: error.message || "Failed to create clearance request",
            },
            { status: 500 }
        );
    }
}


