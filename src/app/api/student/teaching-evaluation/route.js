import { NextResponse } from "next/server";
import connect from "@/lib/mongoose";
import { getStudentTerm } from "@/utils/studentTerm";
import Student from "@/models/Student";
import Evaluation from "@/models/Evaluation";

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

    const term = getStudentTerm(studentId);
    if (term == "L1T1") {
      return NextResponse.json({ success: true, data: true }, { status: 200 });
    } else {
      const evaluation = await Student.findOne({ _id: id }).populate(
        "evaluations"
      );

      if (!evaluation) {
        return NextResponse.json(
          { success: false, data: false },
          { status: 404 }
        );
      }

      // Check if evaluations array exists and has elements
      if (
        !evaluation.evaluations ||
        !Array.isArray(evaluation.evaluations) ||
        evaluation.evaluations.length === 0
      ) {
        return NextResponse.json(
          { success: false, data: false },
          { status: 404 }
        );
      }
      console.log("first")

      // Get today's date
      const today = new Date();
      const currentMonth = today.getMonth() + 1; // getMonth() returns 0-11, so add 1
      const currentYear = today.getFullYear();

      // Determine current semester based on month
      // Jan (1) to April (4) = Spring
      // May (5) to August (8) = Summer
      // September (9) to December (12) = Fall
      let currentSemester, currentSemesterYear;
      if (currentMonth >= 1 && currentMonth <= 4) {
        currentSemester = "spring";
        currentSemesterYear = currentYear;
      } else if (currentMonth >= 5 && currentMonth <= 8) {
        currentSemester = "summer";
        currentSemesterYear = currentYear;
      } else {
        currentSemester = "fall";
        currentSemesterYear = currentYear;
      }

      // Determine previous semester
      let previousSemester, previousSemesterYear;
      if (currentSemester === "spring") {
        // Previous of Spring is Fall of previous year
        previousSemester = "fall";
        previousSemesterYear = currentSemesterYear - 1;
      } else if (currentSemester === "summer") {
        // Previous of Summer is Spring of same year
        previousSemester = "spring";
        previousSemesterYear = currentSemesterYear;
      } else {
        // Previous of Fall is Summer of same year
        previousSemester = "summer";
        previousSemesterYear = currentSemesterYear;
      }

      // Get the last element of the evaluations array
      const lastEvaluation =
        evaluation.evaluations[evaluation.evaluations.length - 1];

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
      const expectedPreviousSemester =
        `${previousSemester} ${previousSemesterYear}`.toLowerCase();
      console.log("a", expectedPreviousSemester);
      console.log("b", lastEvaluationSemester);
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
