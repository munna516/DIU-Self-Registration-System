import { NextResponse } from "next/server";
import connect from "@/lib/mongoose";
import Semester from "@/models/Semester";
export async function GET(request) {
    try {
        await connect();
        // Use lean() for read-only operations to improve performance
        const semester = await Semester.findOne().lean();
        if (!semester) {
            return NextResponse.json({
                success: false,
                message: "Semester not found",
            }, { status: 404 });
        }
        return NextResponse.json({
            success: true,
            data: semester,
        }, { status: 200 });
    } catch (error) {
        return NextResponse.json({
            success: false,
            message: "Failed to fetch semester",
        }, { status: 500 });
    }
}
