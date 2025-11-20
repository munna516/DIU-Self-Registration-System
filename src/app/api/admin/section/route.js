import { NextResponse } from "next/server";
import Section from "@/models/Section";
import connect from "@/lib/mongoose";

export async function GET() {
  try {
    await connect();
    const sections = await Section.find({}).sort({
      department: 1,
      level: 1,
    });
    return NextResponse.json(
      { success: true, data: sections },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching sections:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch sections" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connect();
    const body = await request.json();
    const { department, level, count, sectionType } = body || {};

    if (!department) {
      return NextResponse.json(
        { success: false, message: "Department is required" },
        { status: 400 }
      );
    }

    if (!level) {
      return NextResponse.json(
        { success: false, message: "Level is required" },
        { status: 400 }
      );
    }

    if (!count || count < 1 || count > 30) {
      return NextResponse.json(
        { success: false, message: "Count must be between 1 and 30" },
        { status: 400 }
      );
    }

    if (!sectionType || !["regular", "retake"].includes(sectionType)) {
      return NextResponse.json(
        { success: false, message: "Section Type is required and must be 'regular' or 'retake'" },
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

    // Validate level enum
    const validLevels = [
      "L1T1",
      "L1T2",
      "L1T3",
      "L2T1",
      "L2T2",
      "L2T3",
      "L3T1",
      "L3T2",
      "L3T3",
      "L4T1",
      "L4T2",
      "L4T3",
    ];
    if (!validLevels.includes(level)) {
      return NextResponse.json(
        { success: false, message: "Invalid level" },
        { status: 400 }
      );
    }

    // Check if section already exists for this department, level, and sectionType
    const existing = await Section.findOne({ department, level, sectionType });
    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message: "Section already exists for this department, level, and section type",
        },
        { status: 400 }
      );
    }

    // Initialize sections array based on count
    const sections = [];
    for (let i = 0; i < count; i++) {
      const sectionLetter = String.fromCharCode(65 + i); // A, B, C, etc.
      sections.push({
        name: sectionLetter,
        capacity: 50,
        students: [],
      });
    }

    const sectionData = {
      department,
      level,
      count: Number(count),
      sectionType,
      sections: sections,
    };

    const created = await Section.create(sectionData);
    return NextResponse.json(
      { success: true, data: created },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating section:", error);
    if (error.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          message: "Section already exists for this department and level",
        },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, message: "Failed to create section" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    await connect();
    const body = await request.json();
    const { id, department, level, count, sectionType } = body || {};

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Section ID is required" },
        { status: 400 }
      );
    }

    if (!count || count < 1 || count > 30) {
      return NextResponse.json(
        { success: false, message: "Count must be between 1 and 30" },
        { status: 400 }
      );
    }

    if (sectionType && !["regular", "retake"].includes(sectionType)) {
      return NextResponse.json(
        { success: false, message: "Section Type must be 'regular' or 'retake'" },
        { status: 400 }
      );
    }

    // Validate level enum if provided
    if (level) {
      const validLevels = [
        "L1T1",
        "L1T2",
        "L1T3",
        "L2T1",
        "L2T2",
        "L2T3",
        "L3T1",
        "L3T2",
        "L3T3",
        "L4T1",
        "L4T2",
        "L4T3",
      ];
      if (!validLevels.includes(level)) {
        return NextResponse.json(
          { success: false, message: "Invalid level" },
          { status: 400 }
        );
      }
    }

    // Validate department enum if provided
    if (department) {
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
    }

    const updateData = {
      count: Number(count),
    };

    if (department) {
      updateData.department = department;
    }
    if (level) {
      updateData.level = level;
    }
    if (sectionType) {
      updateData.sectionType = sectionType;
    }

    // Check if updating would create a duplicate
    if (department || level || sectionType) {
      const currentSection = await Section.findById(id);
      if (!currentSection) {
        return NextResponse.json(
          { success: false, message: "Section not found" },
          { status: 404 }
        );
      }

      const checkDepartment = department || currentSection.department;
      const checkLevel = level || currentSection.level;
      const checkSectionType = sectionType || currentSection.sectionType;

      const existing = await Section.findOne({
        department: checkDepartment,
        level: checkLevel,
        sectionType: checkSectionType,
        _id: { $ne: id },
      });

      if (existing) {
        return NextResponse.json(
          {
            success: false,
            message: "Section already exists for this department, level, and section type",
          },
          { status: 400 }
        );
      }
    }

    const updated = await Section.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Section not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: updated },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating section:", error);
    if (error.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          message: "Section already exists for this department and level",
        },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, message: "Failed to update section" },
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
        { success: false, message: "Section ID is required" },
        { status: 400 }
      );
    }

    const deleted = await Section.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Section not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting section:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete section" },
      { status: 500 }
    );
  }
}

