import connect from "@/lib/mongoose";
import Teacher from "@/models/Teacher";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        await connect();
        const { searchParams } = new URL(request.url);
        const department = searchParams.get("department");
        const teachers = await Teacher.find({ department })
            .select("-password") // Exclude password field
            .sort({ name: 1 });
        return NextResponse.json({ success: true, data: teachers }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ success: false, message: "Failed to fetch teachers" }, { status: 500 });
    }
}