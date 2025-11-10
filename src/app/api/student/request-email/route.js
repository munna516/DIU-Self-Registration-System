import connect from "@/lib/mongoose";
import Student from "@/models/Student";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req) {
  const { email, name, studentId, password, department, batch } = await req.json();
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
    department,
    batch,
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
    subject: "Please verify your email",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <title>Email Verification</title>
        </head>
        <body style="font-family: Arial, sans-serif; color: #333;">
          <p>Hello ${name},</p>
          <p>
            Thank you for registering. Please click the link below to verify your email address:
          </p>
          <p>
            <a href="${verifyLink}" style="color: #1a73e8; text-decoration: none;">
              Verify your email
            </a>
          </p>
          <p>If the link does not work, copy and paste this URL into your browser:</p>
          <p style="word-break: break-all;">${verifyLink}</p>
          <p>Thank you!<br>Your Team</p>
        </body>
      </html>
    `,
  });

  return NextResponse.json(
    {
      message: "Check your email to confirm.",
    },
    { status: 200 }
  );
}
