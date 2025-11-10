import { NextResponse } from "next/server";
import RegistrationSchedule from "@/models/RegistrationSchedule";
import connect from "@/lib/mongoose";

export async function GET() {
  try {
    await connect();
    const schedules = await RegistrationSchedule.find({}).sort({
      department: 1,
    });
    return NextResponse.json(
      { success: true, data: schedules },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching registration schedules:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch registration schedules" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connect();
    const body = await request.json();
    const { department, isEnabled, startDate, endDate, startTime, endTime } =
      body || {};

    if (!department) {
      return NextResponse.json(
        { success: false, message: "Department is required" },
        { status: 400 }
      );
    }

    // Validate department enum
    const validDepartments = [
      "CSE",
      "SWE",
      "CIS",
      "EEE",
      "CE",
      "TE",
      "ARC",
      "ICE",
      "LAW",
      "ENG",
      "JMC",
      "BBA",
      "THM",
      "IE",
      "PH",
      "NFE",
      "GEB",
    ];
    if (!validDepartments.includes(department)) {
      return NextResponse.json(
        { success: false, message: "Invalid department" },
        { status: 400 }
      );
    }

    // If enabled, validate required fields
    if (isEnabled) {
      if (!startDate || !endDate || !startTime || !endTime) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Start date, end date, start time, and end time are required when registration is enabled",
          },
          { status: 400 }
        );
      }

      // Validate date range
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (start >= end) {
        return NextResponse.json(
          {
            success: false,
            message: "End date must be after start date",
          },
          { status: 400 }
        );
      }

      // Validate time format (HH:MM)
      const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
        return NextResponse.json(
          {
            success: false,
            message: "Time must be in HH:MM format (24-hour)",
          },
          { status: 400 }
        );
      }

      // Validate time range
      if (startTime >= endTime && startDate === endDate) {
        return NextResponse.json(
          {
            success: false,
            message: "End time must be after start time on the same day",
          },
          { status: 400 }
        );
      }
    }

    // Check if schedule already exists for this department
    const existing = await RegistrationSchedule.findOne({ department });
    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message: "Registration schedule already exists for this department",
        },
        { status: 400 }
      );
    }

    const scheduleData = {
      department,
      isEnabled: Boolean(isEnabled),
    };

    if (isEnabled) {
      scheduleData.startDate = new Date(startDate);
      scheduleData.endDate = new Date(endDate);
      scheduleData.startTime = startTime;
      scheduleData.endTime = endTime;
    }

    const created = await RegistrationSchedule.create(scheduleData);
    return NextResponse.json(
      { success: true, data: created },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating registration schedule:", error);
    if (error.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          message: "Registration schedule already exists for this department",
        },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, message: "Failed to create registration schedule" },
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
      department,
      isEnabled,
      startDate,
      endDate,
      startTime,
      endTime,
    } = body || {};

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Schedule ID is required" },
        { status: 400 }
      );
    }

    // If enabled, validate required fields
    if (isEnabled) {
      if (!startDate || !endDate || !startTime || !endTime) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Start date, end date, start time, and end time are required when registration is enabled",
          },
          { status: 400 }
        );
      }

      // Validate date range
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (start >= end) {
        return NextResponse.json(
          {
            success: false,
            message: "End date must be after start date",
          },
          { status: 400 }
        );
      }

      // Validate time format (HH:MM)
      const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
        return NextResponse.json(
          {
            success: false,
            message: "Time must be in HH:MM format (24-hour)",
          },
          { status: 400 }
        );
      }

      // Validate time range (only if same day)
      if (startTime >= endTime && startDate === endDate) {
        return NextResponse.json(
          {
            success: false,
            message: "End time must be after start time on the same day",
          },
          { status: 400 }
        );
      }
    }

    const updateData = {
      isEnabled: Boolean(isEnabled),
    };

    if (isEnabled) {
      updateData.startDate = new Date(startDate);
      updateData.endDate = new Date(endDate);
      updateData.startTime = startTime;
      updateData.endTime = endTime;
    } else {
      // Clear date/time fields when disabled
      updateData.startDate = null;
      updateData.endDate = null;
      updateData.startTime = null;
      updateData.endTime = null;
    }

    if (department) {
      updateData.department = department;
    }

    const updated = await RegistrationSchedule.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Registration schedule not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: updated },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating registration schedule:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update registration schedule" },
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
        { success: false, message: "Schedule ID is required" },
        { status: 400 }
      );
    }

    const deleted = await RegistrationSchedule.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Registration schedule not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting registration schedule:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete registration schedule" },
      { status: 500 }
    );
  }
}

