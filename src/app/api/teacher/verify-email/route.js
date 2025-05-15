import connect from "@/lib/mongoose";
import jwt from "jsonwebtoken";
import Teacher from "@/models/Teacher";

export async function POST(req) {
  try {
    const { token } = await req.json();
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    await connect();

    // Update the student's verification status
    const updatedTeacher = await Teacher.findOneAndUpdate(
      { email: decoded.email },
      { isVerified: true }
    );

    if (!updatedTeacher) {
      return Response.json({ message: "Teacher not found" }, { status: 404 });
    }

    return Response.json(
      { message: "Email verified successfully" },
      { status: 200 }
    );
  } catch (error) {
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}
