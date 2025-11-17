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

    const semester = await Semester.findOne();
    const term = getStudentTerm(studentId, {
      semester: semester.semester,
      year: semester.year,
    });

    if (term == "L1T1") {
      return NextResponse.json({ success: true, data: true }, { status: 200 });
    } else {
      // Find student - evaluations array now contains objects with { type: ObjectId, semester: String }
      const student = await Student.findOne({ _id: id });

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

      // Get the RegisterCourse document
      const registerCourse = await RegisterCourse.findById(
        registeredCourseRef.type
      );

      if (!registerCourse || !registerCourse.courses) {
        // No courses found in RegisterCourse
        return NextResponse.json(
          { success: false, data: false },
          { status: 404 }
        );
      }

      // Count the number of registered courses
      const numberOfRegisteredCourses = registerCourse.courses.length;

      // Get the Evaluation document for this semester
      const evaluation = await Evaluation.findById(lastEvaluation.type);

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
