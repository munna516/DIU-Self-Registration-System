import { NextResponse } from "next/server";
import connect from "@/lib/mongoose";
import RegisterCourse from "@/models/RegisterCourse";
import Student from "@/models/Student";
import Semester from "@/models/Semester";
import Section from "@/models/Section";

export async function GET(request) {
  try {
    await connect();
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");
    const semester = searchParams.get("semester"); // Optional: if not provided, use current semester

    if (!studentId) {
      return NextResponse.json(
        { success: false, message: "Student ID is required" },
        { status: 400 }
      );
    }

    // Fetch student and semester in parallel if semester not provided
    let semesterString;
    let student;
    
    if (semester) {
      // Use the provided semester
      semesterString = semester;
      // Use lean() for read-only operations
      student = await Student.findOne({ studentId }).lean();
    } else {
      // Get current semester and student in parallel
      const [currentSemester, studentData] = await Promise.all([
        Semester.findOne().lean(),
        Student.findOne({ studentId }).lean(),
      ]);
      
      if (!currentSemester) {
        return NextResponse.json(
          { success: false, message: "Current semester not found" },
          { status: 404 }
        );
      }
      semesterString = `${currentSemester.semester} ${currentSemester.year}`;
      student = studentData;
    }
    
    if (!student) {
      return NextResponse.json(
        { success: false, message: "Student not found" },
        { status: 404 }
      );
    }

    // Find RegisterCourse for the specified semester
    const registerCourse = await RegisterCourse.findOne({
      student: student._id,
      semester: semesterString,
    }).populate({
      path: "courses.course",
      model: "Course",
      select: "courseCode courseTitle credit courseType",
    });

    if (!registerCourse) {
      return NextResponse.json({
        success: true,
        data: [],
        message: "No courses enrolled for current semester",
      });
    }

    // Get only the section IDs that are actually used by this student's courses
    const sectionIds = registerCourse.courses.map((item) => item.section);
    
    // Fetch only the Section documents that contain these section IDs
    // We need to find which Section documents contain these section object IDs
    // Only select the sections array to reduce data transfer
    const sectionDocs = await Section.find({
      department: student.department,
    }).select("sections").lean();

    // Create a map of section _id to section name
    const sectionMap = new Map();
    sectionDocs.forEach((sectionDoc) => {
      sectionDoc.sections.forEach((sectionObj) => {
        const sectionIdStr = sectionObj._id.toString();
        // Only add sections that are actually used
        if (sectionIds.some((id) => id.toString() === sectionIdStr)) {
          sectionMap.set(sectionIdStr, sectionObj.name);
        }
      });
    });

    // Transform the data to a simpler format
    const enrolledCourses = registerCourse.courses.map((item, index) => {
      const sectionName = sectionMap.get(item.section.toString()) || "N/A";
      return {
        code: item.course.courseCode,
        title: item.course.courseTitle,
        credit: item.course.credit,
        section: sectionName,
        courseType: item.course.courseType,
        teacher: "N/A", // Teacher info not available in current schema - can be added later
      };
    });

    return NextResponse.json({
      success: true,
      data: enrolledCourses,
    });
  } catch (error) {
    console.error("Error fetching registered courses:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch registered courses",
      },
      { status: 500 }
    );
  }
}

