import { NextResponse } from "next/server";
import Teacher from "@/models/Teacher";
import connect from "@/lib/mongoose";

export async function GET() {
  try {
    await connect();
    const teachers = await Teacher.find({})
      .select("-password") // Exclude password field
      .sort({ name: 1 });
    
    return NextResponse.json(
      { success: true, data: teachers },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching teachers:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch teachers" },
      { status: 500 }
    );
  }
}

