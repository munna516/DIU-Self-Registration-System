import { NextResponse } from "next/server";
import Announcement from "@/models/Announcement";
import connect from "@/lib/mongoose";

export async function GET() {
  try {
    await connect();
    const items = await Announcement.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: items }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch announcements" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connect();
    const body = await request.json();
    const { title, message, department, postDate } = body || {};
    if (!title || !message || !department) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }
    const created = await Announcement.create({
      title,
      message,
      department,
      postDate: postDate ? new Date(postDate) : new Date(),
    });
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to create announcement" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    await connect();
    const body = await request.json();
    const { id, title, message, department } = body || {};
    if (!id) {
      return NextResponse.json(
        { success: false, message: "Missing id" },
        { status: 400 }
      );
    }
    if (!title || !message || !department) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }
    const updated = await Announcement.findByIdAndUpdate(
      id,
      { title, message, department },
      { new: true }
    );
    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Announcement not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: updated }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to update announcement" },
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
        { success: false, message: "Missing id" },
        { status: 400 }
      );
    }
    const deleted = await Announcement.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Announcement not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to delete announcement" },
      { status: 500 }
    );
  }
}
