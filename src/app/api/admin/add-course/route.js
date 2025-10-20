import { NextResponse } from "next/server";
import Course from "@/models/Course";
import connect from "@/lib/mongoose";

export async function GET() {
  try {
    await connect();
    const courses = await Course.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: courses }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connect();
    const body = await request.json();
    const {
      courseCode,
      courseTitle,
      department,
      level,
      courseType,
      credit,
      prerequisite,
    } = body || {};

    if (
      !courseCode ||
      !courseTitle ||
      !department ||
      !level ||
      !courseType ||
      !credit
    ) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const creditNum = Number(credit);
    if (Number.isNaN(creditNum) || creditNum < 1 || creditNum > 3) {
      return NextResponse.json(
        { success: false, message: "Credit must be between 1 and 3" },
        { status: 400 }
      );
    }

    const prereqArray = prerequisite
      ? [String(prerequisite).trim()].filter(Boolean)
      : [];

    const created = await Course.create({
      courseCode,
      courseTitle,
      department,
      level,
      courseType,
      credit: creditNum,
      prerequisite: prereqArray,
    });
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to create course" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    await connect();
    const body = await request.json();
    const {
      id,
      courseCode,
      courseTitle,
      department,
      level,
      courseType,
      credit,
      prerequisite,
    } = body || {};

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Missing course id" },
        { status: 400 }
      );
    }
    if (
      !courseCode ||
      !courseTitle ||
      !department ||
      !level ||
      !courseType ||
      !credit
    ) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const creditNum = Number(credit);
    if (Number.isNaN(creditNum) || creditNum < 1 || creditNum > 3) {
      return NextResponse.json(
        { success: false, message: "Credit must be between 1 and 3" },
        { status: 400 }
      );
    }

    const prereqArray = prerequisite
      ? [String(prerequisite).trim()].filter(Boolean)
      : [];

    const updated = await Course.findByIdAndUpdate(
      id,
      {
        courseCode,
        courseTitle,
        department,
        level,
        courseType,
        credit: creditNum,
        prerequisite: prereqArray,
      },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Course not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updated }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to update course" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    await connect();
    const body = await request.json();
    const { id } = body || {};
    if (!id) {
      return NextResponse.json(
        { success: false, message: "Missing course id" },
        { status: 400 }
      );
    }

    const deleted = await Course.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Course not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to delete course" },
      { status: 500 }
    );
  }
}
