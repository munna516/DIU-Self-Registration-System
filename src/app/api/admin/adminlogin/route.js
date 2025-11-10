import { NextResponse } from "next/server";
import connect from "@/lib/mongoose";
import Admin from "@/models/Admin";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    await connect();
    const adminExist = await Admin.findOne({ email });
    if (!adminExist) {
      console.log("Admin with this email not found");
      return NextResponse.json(
        { message: "Admin with this email not found" },
        { status: 404 }
      );
    }
    const passwordMatch = await bcrypt.compare(password, adminExist.password);
    if (!passwordMatch) {
      console.log("Invalid password");
      return NextResponse.json(
        { message: "Invalid password" },
        { status: 401 }
      );
    }
    const { password: _, ...admins } = adminExist.toObject();
    const admin = { ...admins, role: "admin" };
    console.log("This is admin", admin);
    return NextResponse.json(
      { message: "Admin login successful", admin },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
