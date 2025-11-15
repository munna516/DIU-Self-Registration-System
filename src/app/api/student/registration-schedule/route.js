import { NextResponse } from "next/server";
import RegistrationSchedule from "@/models/RegistrationSchedule";
import connect from "@/lib/mongoose";

export async function GET(request) {
  try {
    await connect();
    const { searchParams } = new URL(request.url);
    const department = searchParams.get("department");
    if (!department) {
      return NextResponse.json(
        { success: false, message: "Department is required" },
        { status: 400 }
      );
    }
    const registrationSchedule = await RegistrationSchedule.findOne({
      department: department,
    });
    return NextResponse.json({ success: true, data: registrationSchedule });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch registration schedule" },
      { status: 500 }
    );
  }
}
