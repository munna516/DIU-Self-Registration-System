import connect from "@/lib/mongoose";
import Teacher from "@/models/Teacher";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

export async function POST(req) {
  const { name, teacherId, email, phone, designation, department, password } =
    await req.json();
  console.log(name, teacherId, email, phone, designation, department, password);
  await connect();
  const existingTeacher = await Teacher.findOne({ email });
  if (existingTeacher) {
    return Response.json(
      { message: "Teacher already exists" },
      { status: 400 }
    );
  }

  const hashedPassword = await bcrypt.hash(password, 5);
  const newTeacher = new Teacher({
    name,
    teacherId,
    email,
    phone,
    designation,
    department,
    password: hashedPassword,
    isVerified: false,
  });
  console.log("newTeacher", newTeacher);

  await newTeacher.save();

  const token = jwt.sign({ email }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  const verifyLink = `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/verify-teacher-email?token=${token}`;
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
