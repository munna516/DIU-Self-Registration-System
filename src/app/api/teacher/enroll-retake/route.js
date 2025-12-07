import { NextResponse } from "next/server";
import connect from "@/lib/mongoose";
import Student from "@/models/Student";
import RegisterCourse from "@/models/RegisterCourse";
import Course from "@/models/Course";
import Section from "@/models/Section";
import Semester from "@/models/Semester";

export async function POST(request) {
  try {
    await connect();
    const body = await request.json();
    const { studentId, courseId } = body;

    // Validation
    if (!studentId) {
      return NextResponse.json(
        { success: false, message: "Student ID is required" },
        { status: 400 }
      );
    }

    if (!courseId) {
      return NextResponse.json(
        { success: false, message: "Course ID is required" },
        { status: 400 }
      );
    }

    // Get student
    const student = await Student.findOne({ studentId });
    if (!student) {
      return NextResponse.json(
        { success: false, message: "Student not found" },
        { status: 404 }
      );
    }

    // Get course
    const course = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json(
        { success: false, message: "Course not found" },
        { status: 404 }
      );
    }

    // Get current semester
    const currentSemester = await Semester.findOne();
    if (!currentSemester) {
      return NextResponse.json(
        { success: false, message: "Current semester not found" },
        { status: 404 }
      );
    }

    const semesterString = `${currentSemester.semester} ${currentSemester.year}`;

    // Check if student already enrolled in this course for current semester
    const existingRegisterCourse = await RegisterCourse.findOne({
      student: student._id,
      semester: semesterString,
    }).populate("courses.course");

    if (existingRegisterCourse) {
      const alreadyEnrolled = existingRegisterCourse.courses.some(
        (c) => c.course._id.toString() === courseId
      );

      if (alreadyEnrolled) {
        return NextResponse.json(
          {
            success: false,
            message: "Student is already enrolled in this course for current semester",
          },
          { status: 400 }
        );
      }
    }

    // Get or create retake section document
    const getRetakeSectionDoc = async () => {
      let sectionDoc = await Section.findOne({
        department: student.department,
        level: course.level,
        sectionType: "retake",
      });

      if (!sectionDoc) {
        // Create Section document with initial sections
        const initialSections = [
          {
            name: "A",
            capacity: 50,
            students: [],
          },
        ];

        sectionDoc = await Section.create({
          department: student.department,
          level: course.level,
          sectionType: "retake",
          count: 1,
          sections: initialSections,
        });
      }

      return sectionDoc;
    };

    const sectionDoc = await getRetakeSectionDoc();

    // Find the first available section (one that's not full)
    let sectionObj = sectionDoc.sections.find(
      (s) => s.students.length < s.capacity
    );

    // If no available section, create a new one
    if (!sectionObj) {
      const nextSectionIndex = sectionDoc.count;
      if (nextSectionIndex >= 26) {
        return NextResponse.json(
          {
            success: false,
            message: "All retake sections are full",
          },
          { status: 400 }
        );
      }

      const nextSectionName = String.fromCharCode(65 + nextSectionIndex); // A, B, C, etc.
      
      // Check if section already exists (shouldn't happen, but just in case)
      let nextSectionObj = sectionDoc.sections.find(
        (s) => s.name === nextSectionName
      );

      if (!nextSectionObj) {
        sectionDoc.sections.push({
          name: nextSectionName,
          capacity: 50,
          students: [],
        });
        sectionDoc.count += 1;
        nextSectionObj = sectionDoc.sections[sectionDoc.sections.length - 1];
      }

      sectionObj = nextSectionObj;
    }

    // Add student to section
    if (!sectionObj.students.includes(student._id)) {
      sectionObj.students.push(student._id);
    }

    // Save section document
    await sectionDoc.save();

    // Get or create RegisterCourse for current semester
    let registerCourse = existingRegisterCourse;
    if (!registerCourse) {
      registerCourse = await RegisterCourse.create({
        student: student._id,
        semester: semesterString,
        courses: [],
      });
    }

    // Add course to RegisterCourse
    registerCourse.courses.push({
      course: course._id,
      section: sectionObj._id,
      status: "enrolled",
    });

    await registerCourse.save();

    return NextResponse.json({
      success: true,
      message: "Course added as retake successfully",
      data: {
        courseCode: course.courseCode,
        courseTitle: course.courseTitle,
        section: sectionObj.name,
      },
    });
  } catch (error) {
    console.error("Error enrolling retake course:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to enroll retake course",
      },
      { status: 500 }
    );
  }
}

