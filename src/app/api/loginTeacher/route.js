import connect from "@/lib/mongoose";
import Teacher from "@/models/Teacher";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    await connect();
    const teacherExist = await Teacher.findOne({ email });
    if (!teacherExist) {
      return Response.json(
        { message: "Teacher with this email not found" },
        { status: 404 }
      );
    }
    if (teacherExist.isVerified === false) {
      return Response.json(
        { message: "Please verify your email first" },
        { status: 402 }
      );
    }
    const passwordMatch = await bcrypt.compare(password, teacherExist.password);
    console.log(passwordMatch);
    if (!passwordMatch) {
      return Response.json({ message: "Invalid password" }, { status: 401 });
    }
    const { password: _, ...teachers } = teacherExist.toObject();
    const teacher = { ...teachers, role: "teacher" };
    return Response.json(
      { message: "Login successful", teacher },
      { status: 200 }
    );
  } catch (error) {
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}
