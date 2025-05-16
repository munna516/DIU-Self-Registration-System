import connect from "@/lib/mongoose";
import Student from "@/models/Student";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    await connect();
    const studentExist = await Student.findOne({ email });
    if (!studentExist) {
      return Response.json(
        { message: "Student with this email not found" },
        { status: 404 }
      );
    }
    if (studentExist.isVerified === false) {
      return Response.json(
        { message: "Please verify your email first" },
        { status: 402 }
      );
    }
    const passwordMatch = await bcrypt.compare(password, studentExist.password);
    console.log(passwordMatch);
    if (!passwordMatch) {
      return Response.json({ message: "Invalid password" }, { status: 401 });
    }
    const { password: _, ...students } = studentExist.toObject();

    const student = { ...students, role: "student" };
    console.log("from server students", student);
    return Response.json(
      { message: "Login successful", student },
      { status: 200 }
    );
  } catch (error) {
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}
