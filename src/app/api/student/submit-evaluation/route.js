import { NextResponse } from "next/server";
import connect from "@/lib/mongoose";
import Student from "@/models/Student";
import Evaluation from "@/models/Evaluation";
import Course from "@/models/Course";

// Submit teaching evaluation
export async function POST(request) {
  try {
    await connect();
    const body = await request.json();
    const { studentId, semester, courseId,  answers } = body;

    if (!studentId || !semester || !courseId || !answers) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
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

    // Check if evaluation already exists for this student and semester
    let evaluation = await Evaluation.findOne({
      student: student._id,
      semester: semester,
    });

    if (evaluation) {
      // Check if this course has already been evaluated
      const existingCourseEvaluation = evaluation.evaluations.find(
        (evalItem) => evalItem.course.toString() === courseId
      );

      if (existingCourseEvaluation) {
        return NextResponse.json(
          {
            success: false,
            message: "Evaluation already submitted for this course",
          },
          { status: 400 }
        );
      }

      // Push new course evaluation to existing document
      evaluation.evaluations.push({
        course: courseId,
        answers: answers.map((answer, index) => ({
          questionNo: index + 1,
          questionText: answer.questionText || `Question ${index + 1}`,
          rating: answer.rating,
        })),
      });
    } else {
      // Create new evaluation document
      evaluation = new Evaluation({
        student: student._id,
        semester: semester,
        evaluations: [
          {
            course: courseId,
            answers: answers.map((answer, index) => ({
              questionNo: index + 1,
              questionText: answer.questionText || `Question ${index + 1}`,
              rating: answer.rating,
            })),
          },
        ],
      });
    }

    // Save the evaluation
    await evaluation.save();

    // Update student's evaluations array
    // Check if this evaluation reference already exists for this semester
    const existingEvaluationRef = student.evaluations.find(
      (evalRef) =>
        evalRef.type.toString() === evaluation._id.toString() &&
        evalRef.semester === semester
    );

    if (!existingEvaluationRef) {
      student.evaluations.push({
        type: evaluation._id,
        semester: semester,
      });
      await student.save();
    }

    return NextResponse.json({
      success: true,
      message: "Evaluation submitted successfully",
      data: evaluation,
    });
  } catch (error) {
    console.error("Error submitting evaluation:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to submit evaluation",
      },
      { status: 500 }
    );
  }
}
