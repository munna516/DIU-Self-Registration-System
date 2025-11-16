import { NextResponse } from "next/server";
import connect from "@/lib/mongoose";
import { getStudentTerm } from "@/utils/studentTerm";
import Student from "@/models/Student";
import Evaluation from "@/models/Evaluation";
import { getPreviousSemester } from "@/utils/getPreviousSemester";
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
    const term = getStudentTerm(studentId, { semester: semester.semester, year: semester.year });

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

      console.log("student evaluations", student.evaluations);

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

      // Normalize the semester string for comparison (case-insensitive)
      const lastEvaluationSemester = lastEvaluation.semester
        .toLowerCase()
        .trim();
      const expectedPreviousSemester = `${getPreviousSemester()}`.toLowerCase();

      // Check if the last evaluation's semester matches the previous semester
      if (lastEvaluationSemester === expectedPreviousSemester) {
        return NextResponse.json(
          { success: true, data: true },
          { status: 200 }
        );
      } else {
        return NextResponse.json(
          {
            success: false,
            data: false,
          },
          { status: 404 }
        );
      }
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
