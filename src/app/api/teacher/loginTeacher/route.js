import connect from "@/lib/mongoose";
import Teacher from "@/models/Teacher";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    await connect();
    const teacherExist = await Teacher.findOne({ email });
    if (!teacherExist) {
      return NextResponse.json(
        { message: "Teacher with this email not found" },
        { status: 404 }
      );
    }
    if (teacherExist.isVerified === false) {
      return NextResponse.json(
        { message: "Please verify your email first" },
        { status: 402 }
      );
    }
    const passwordMatch = await bcrypt.compare(password, teacherExist.password);
    if (!passwordMatch) {
      return NextResponse.json({ message: "Invalid password" }, { status: 401 });
    }
    const { password: _, ...teachers } = teacherExist.toObject();
    const teacher = { ...teachers, role: "teacher" };
    return NextResponse.json(
      { message: "Login successful", teacher },
      { status: 200 }
    );
  } catch (error) {
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}
