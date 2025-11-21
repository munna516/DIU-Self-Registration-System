import { NextResponse } from "next/server";
import connect from "@/lib/mongoose";
import { getStudentTerm } from "@/utils/studentTerm";
import Student from "@/models/Student";
import Evaluation from "@/models/Evaluation";
import RegisterCourse from "@/models/RegisterCourse";
import Semester from "@/models/Semester";

export async function GET(request) {
  try {
    await connect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const studentId = searchParams.get("studentId");
    if (!id || !studentId) {
      return NextResponse.json(
        { success: false, data: false },
        { status: 400 }
      );
    }

    // Fetch semester and student in parallel
    const [semester, student] = await Promise.all([
      Semester.findOne().lean(),
      Student.findOne({ _id: id }).lean(),
    ]);

    if (!semester) {
      return NextResponse.json(
        { success: false, data: false },
        { status: 404 }
      );
    }

    const term = getStudentTerm(studentId, {
      semester: semester.semester,
      year: semester.year,
    });

    if (term == "L1T1") {
      return NextResponse.json({ success: true, data: true }, { status: 200 });
    } else {
      // Find student - evaluations array now contains objects with { type: ObjectId, semester: String }

      if (!student) {
        return NextResponse.json(
          { success: false, data: false },
          { status: 404 }
        );
      }



      // Check if evaluations array exists and has elements
      if (
        !student.evaluations ||
        !Array.isArray(student.evaluations) ||
        student.evaluations.length === 0
      ) {
        return NextResponse.json(
          { success: false, data: false },
          { status: 404 }
        );
      }

      // Get the last element of the evaluations array
      // Now evaluations is an array of objects: [{ type: ObjectId, semester: String }, ...]
      const lastEvaluation =
        student.evaluations[student.evaluations.length - 1];

      // Check if last evaluation exists and has a semester field
      if (!lastEvaluation || !lastEvaluation.semester) {
        return NextResponse.json(
          {
            success: false,
            data: false,
          },
          { status: 404 }
        );
      }

      // Get the last evaluation semester
      const lastEvaluationSemester = lastEvaluation.semester;

      // Find the RegisterCourse that matches the lastEvaluationSemester
      const registeredCourseRef = student.registeredCourses.find(
        (regCourse) => regCourse.semester === lastEvaluationSemester
      );
      if (!registeredCourseRef) {
        // No registered courses found for this semester
        return NextResponse.json(
          { success: false, data: false },
          { status: 404 }
        );
      }

      // Fetch RegisterCourse and Evaluation in parallel
      const [registerCourse, evaluation] = await Promise.all([
        RegisterCourse.findById(registeredCourseRef.type).lean(),
        Evaluation.findById(lastEvaluation.type).lean(),
      ]);

      if (!registerCourse || !registerCourse.courses) {
        // No courses found in RegisterCourse
        return NextResponse.json(
          { success: false, data: false },
          { status: 404 }
        );
      }

      // Count the number of registered courses
      const numberOfRegisteredCourses = registerCourse.courses.length;

      if (!evaluation || !evaluation.evaluations) {
        // No evaluation found or no courses evaluated
        return NextResponse.json(
          { success: false, data: false },
          { status: 404 }
        );
      }

      // Count the number of evaluated courses
      const numberOfEvaluatedCourses = evaluation.evaluations.length;

      // Compare the counts
      const isComplete = numberOfRegisteredCourses === numberOfEvaluatedCourses;
      
      return NextResponse.json(
        { success: true, data: isComplete },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Error in teaching-evaluation route:", error);
    return NextResponse.json(
      {
        success: false,
        data: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
