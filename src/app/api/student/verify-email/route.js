import connect from "@/lib/mongoose";
import Student from "@/models/Student";
import jwt from "jsonwebtoken";

export async function POST(req) {
  try {
    const { token } = await req.json();
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    await connect();

    // Update the student's verification status
    const updatedStudent = await Student.findOneAndUpdate(
      { email: decoded.email },
      { isVerified: true }
    );

    if (!updatedStudent) {
      return Response.json({ message: "Student not found" }, { status: 404 });
    }

    return Response.json(
      { message: "Email verified successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Verification error:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}
