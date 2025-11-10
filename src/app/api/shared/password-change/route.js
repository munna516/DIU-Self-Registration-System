import connect from "@/lib/mongoose";
import Student from "@/models/Student";
import Teacher from "@/models/Teacher";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
export async function PUT(req) {
    await connect();
    try {
        const { email, oldPassword, newPassword, studentId, teacherId } = await req.json();
        if (studentId) {
            const student = await Student.findOne({ studentId, email });
            if (!student) {
                return NextResponse.json({ message: "Student not found" }, { status: 404 });
            }
            const passwordMatch = await bcrypt.compare(oldPassword, student.password);
            if (!passwordMatch) {
                return NextResponse.json({ message: "Invalid old password" }, { status: 401 });
            }
            const hashedPassword = await bcrypt.hash(newPassword, 5);
            student.password = hashedPassword;
            await student.save();
            return NextResponse.json({ message: "Password changed successfully" }, { status: 200 });
        } else if (teacherId) {
            const teacher = await Teacher.findOne({ teacherId, email });
            if (!teacher) {
                return NextResponse.json({ message: "Teacher not found" }, { status: 404 });
            }
            const passwordMatch = await bcrypt.compare(oldPassword, teacher.password);
            if (!passwordMatch) {
                return NextResponse.json({ message: "Invalid old password" }, { status: 401 });
            }
            const hashedPassword = await bcrypt.hash(newPassword, 5);
            teacher.password = hashedPassword;
            await teacher.save();
            return NextResponse.json({ message: "Password changed successfully" }, { status: 200 });
        }
        return NextResponse.json({ message: "User not found" }, { status: 404 });
    } catch (error) {
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
