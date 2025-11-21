import { NextResponse } from "next/server";
import connect from "@/lib/mongoose";
import Course from "@/models/Course";
import Section from "@/models/Section";
import Student from "@/models/Student";
import RegisterCourse from "@/models/RegisterCourse";
import Semester from "@/models/Semester";
import { getStudentTerm } from "@/utils/studentTerm";

export async function GET(request) {
  try {
    await connect();
    const { searchParams } = new URL(request.url);
    const department = searchParams.get("department");
    const studentId = searchParams.get("studentId");
    if (!department) {
      return NextResponse.json(
        { success: false, message: "Department is required" },
        { status: 400 }
      );
    }

    if (!studentId) {
      return NextResponse.json(
        { success: false, message: "Student ID is required" },
        { status: 400 }
      );
    }

    // Use lean() for read-only operations to improve performance
    const semester = await Semester.findOne().lean();
    // Calculate student level using getStudentTerm function
    const level = getStudentTerm(studentId, {
      semester: semester.semester,
      year: semester.year,
    });

    // Fetch courses based on department and level - only select needed fields
    // Use lean() for read-only operations to improve performance
    const courses = await Course.find({
      department: department,
      level: level,
    }).select("courseCode courseTitle credit courseType prerequisite").lean();

    return NextResponse.json({
      success: true,
      data: courses,
    });
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch courses",
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connect();
    const body = await request.json();
    const { studentId, department, courses: coursesToEnroll } = body;

    // Validation
    if (!studentId) {
      return NextResponse.json(
        { success: false, message: "Student ID is required" },
        { status: 400 }
      );
    }

    if (!department) {
      return NextResponse.json(
        { success: false, message: "Department is required" },
        { status: 400 }
      );
    }

    if (
      !coursesToEnroll ||
      !Array.isArray(coursesToEnroll) ||
      coursesToEnroll.length === 0
    ) {
      return NextResponse.json(
        { success: false, message: "Courses array is required" },
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

    // Get current semester
    const currentSemester = await Semester.findOne();
    if (!currentSemester) {
      return NextResponse.json(
        { success: false, message: "Current semester not found" },
        { status: 404 }
      );
    }
    const semesterString = `${currentSemester.semester} ${currentSemester.year}`;

    // Calculate student level
    const level = getStudentTerm(studentId);

    // Check if student already has a RegisterCourse for this semester
    let existingRegisterCourse = await RegisterCourse.findOne({
      student: student._id,
      semester: semesterString,
    }).populate("courses.course");

    // Get list of already enrolled course IDs for this semester
    const enrolledCourseIds = existingRegisterCourse
      ? existingRegisterCourse.courses.map((c) => c.course._id.toString())
      : [];

    // Helper function to get or create section document
    const getSectionDoc = async (sectionType = "regular") => {
      let sectionDoc = await Section.findOne({ 
        department, 
        level, 
        sectionType 
      });
      
      if (!sectionDoc) {
        // Create Section document with initial sections based on a default count
        // Default to 4 sections (A, B, C, D) if not specified
        const defaultCount = 4;
        const initialSections = [];
        for (let i = 0; i < defaultCount; i++) {
          const sectionLetter = String.fromCharCode(65 + i); // A, B, C, etc.
          initialSections.push({
            name: sectionLetter,
            capacity: 50,
            students: [],
          });
        }

        sectionDoc = await Section.create({
          department,
          level,
          sectionType,
          count: defaultCount,
          sections: initialSections,
        });
      }
      
      return sectionDoc;
    };

    // Helper function to generate section letter from index
    const getSectionLetter = (index) => String.fromCharCode(65 + index); // A, B, C, etc.

    // Process each course enrollment
    const enrollmentData = [];
    const modifiedSectionDocs = new Map(); // Track modified section documents

    for (const courseEnroll of coursesToEnroll) {
      const { code, section: sectionName, isRetake } = courseEnroll;

      // Find the course - first try current level, then try all levels (for retake courses from previous levels)
      let course = await Course.findOne({
        courseCode: code,
        department,
        level,
      });
      
      // If not found in current level, search in all levels (for retake courses)
      if (!course) {
        course = await Course.findOne({
          courseCode: code,
          department,
        });
      }
      
      if (!course) {
        return NextResponse.json(
          { success: false, message: `Course ${code} not found` },
          { status: 404 }
        );
      }

      // Check if student is already enrolled in this specific course for this semester
      if (enrolledCourseIds.includes(course._id.toString())) {
        // Student already enrolled in this course, skip it
        continue;
      }

      // Get the appropriate section document based on sectionType (regular or retake)
      const sectionType = isRetake ? "retake" : "regular";
      const sectionDocKey = `${sectionType}`;
      
      // Get or retrieve section document from cache
      let sectionDoc = modifiedSectionDocs.get(sectionDocKey);
      if (!sectionDoc) {
        sectionDoc = await getSectionDoc(sectionType);
        modifiedSectionDocs.set(sectionDocKey, sectionDoc);
      }

      // Find the section object in the sections array
      let sectionObj = sectionDoc.sections.find((s) => s.name === sectionName);

      // If section doesn't exist, create it
      if (!sectionObj) {
        // Check if we've reached maximum sections (26 letters A-Z)
        if (sectionDoc.count >= 26) {
          return NextResponse.json(
            { success: false, message: "Maximum sections limit reached" },
            { status: 400 }
          );
        }

        // Create new section
        sectionDoc.sections.push({
          name: sectionName,
          capacity: 50,
          students: [],
        });

        // Update count if this is a new base section (A, B, C, etc.)
        // Check if sectionName is a single letter (base section)
        if (sectionName.length === 1 && /^[A-Z]$/.test(sectionName)) {
          const sectionIndex = sectionName.charCodeAt(0) - 65; // A=0, B=1, etc.
          if (sectionIndex >= sectionDoc.count) {
            sectionDoc.count = sectionIndex + 1;
          }
        }

        // Get the newly created section
        sectionObj = sectionDoc.sections[sectionDoc.sections.length - 1];
      }

      // Check if section is full (capacity reached)
      if (sectionObj.students.length >= sectionObj.capacity) {
        // Section is full, check if we can create a new section
        const newSectionIndex = sectionDoc.count;
        if (newSectionIndex >= 26) {
          return NextResponse.json(
            {
              success: false,
              message: `Section ${sectionName} is full and maximum sections reached`,
            },
            { status: 400 }
          );
        }

        const newSectionName = getSectionLetter(newSectionIndex);

        // Check if new section already exists
        let newSectionObj = sectionDoc.sections.find(
          (s) => s.name === newSectionName
        );
        if (!newSectionObj) {
          // Create new section
          sectionDoc.sections.push({
            name: newSectionName,
            capacity: 50,
            students: [],
          });
          sectionDoc.count += 1;
          newSectionObj = sectionDoc.sections[sectionDoc.sections.length - 1];
        }

        // Use the new section for enrollment
        sectionObj = newSectionObj;
      }

      // Check if current section has >= 47 students (before adding this student)
      // If so, create a new section for future enrollments
      const currentStudentCount = sectionObj.students.length;
      if (currentStudentCount >= 47) {
        const nextSectionIndex = sectionDoc.count;
        if (nextSectionIndex < 26) {
          const nextSectionName = getSectionLetter(nextSectionIndex);
          const nextSectionExists = sectionDoc.sections.find(
            (s) => s.name === nextSectionName
          );

          if (!nextSectionExists) {
            // Create new section for future enrollments
            sectionDoc.sections.push({
              name: nextSectionName,
              capacity: 50,
              students: [],
            });
            sectionDoc.count += 1;
          }
        }
      }

      // Check if student is already in this section's students array
      // If not, add them (students can be in the same section for multiple courses)
      const isInSection = sectionObj.students.some(
        (id) => id.toString() === student._id.toString()
      );

      if (!isInSection) {
        // Add student to section's students array if not already there
        sectionObj.students.push(student._id);
      }

      // Store enrollment data with the individual section object's _id (not the parent Section document's _id)
      // Note: We'll get the _id after saving, so store the section object reference for now
      enrollmentData.push({
        course: course._id,
        sectionObj: sectionObj, // Store reference to get _id after save
        sectionName: sectionName, // Store name to find it after save
        sectionType: sectionType, // Store section type to find correct section doc
      });
    }

    // Check if we have any enrollments to process
    if (enrollmentData.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "No new courses to enroll. You may already be enrolled in these courses.",
        },
        { status: 400 }
      );
    }

    // Mark sections array as modified and save all modified section documents
    for (const [key, sectionDoc] of modifiedSectionDocs.entries()) {
      sectionDoc.markModified("sections");
      await sectionDoc.save();
    }

    // Now get the section object _ids after saving
    const finalEnrollmentData = enrollmentData.map((item) => {
      // Find the correct section document based on sectionType
      const sectionDocKey = item.sectionType;
      const sectionDoc = modifiedSectionDocs.get(sectionDocKey);
      
      // Find the section object again after save to get its _id
      const sectionObj = sectionDoc.sections.find(
        (s) => s.name === item.sectionName
      );
      return {
        course: item.course,
        section: sectionObj._id, // Use the individual section object's _id
      };
    });

    // Create or update RegisterCourse entry with all courses
    let registerCourse;
    if (existingRegisterCourse) {
      // Add new courses to existing RegisterCourse
      existingRegisterCourse.courses.push(...finalEnrollmentData);
      await existingRegisterCourse.save();
      registerCourse = existingRegisterCourse;
    } else {
      // Create new RegisterCourse entry with all courses
      registerCourse = new RegisterCourse({
        student: student._id,
        semester: semesterString,
        courses: finalEnrollmentData, // All courses with individual section object _ids
      });
      await registerCourse.save();

      // Update student's registeredCourses array
      // Now registeredCourses is an array of objects: [{ type: ObjectId, semester: String }, ...]
      student.registeredCourses.push({
        type: registerCourse._id,
        semester: semesterString,
      });
      await student.save();
    }

    return NextResponse.json({
      success: true,
      message: `Successfully enrolled in ${finalEnrollmentData.length} course(s)`,
      data: registerCourse,
    });
  } catch (error) {
    console.error("Error enrolling courses:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to enroll courses",
      },
      { status: 500 }
    );
  }
}
