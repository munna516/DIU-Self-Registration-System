import connect from "@/lib/mongoose";
import Student from "@/models/Student";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

export async function POST(req) {
  const { email, name, studentId, password } = await req.json();
  await connect();
  const existingStudent = await Student.findOne({ email });
  if (existingStudent) {
    return Response.json(
      { message: "Student already exists" },
      { status: 400 }
    );
  }
  const hashedPassword = await bcrypt.hash(password, 5);
  const newStudent = new Student({
    email,
    name,
    password: hashedPassword,
    studentId,
    isVerified: false,
  });
  await newStudent.save();
  const token = jwt.sign({ email }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  const verifyLink = `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/verify-email?token=${token}`;
  const transporter = nodemailer.createTransport({
    service: "gmail",

    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  await transporter.sendMail({
    to: email,
    subject: "Verify your email",
    html: `<p>Click <a href="${verifyLink}">here</a> to verify.</p>`,
  });
  return Response.json({
    message: "Check your email to confirm.",
    status: 200,
  });
}
