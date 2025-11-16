import { NextResponse } from "next/server";
import connect from "@/lib/mongoose";
import Student from "@/models/Student";
import Evaluation from "@/models/Evaluation";
import Teacher from "@/models/Teacher";
import Course from "@/models/Course";

// Submit teaching evaluation
export async function POST(request) {
  try {
    await connect();
    const body = await request.json();
    const { studentId, semester, courseId, sectionId, answers } = body;

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

    // For now, we'll need to get teacher info from somewhere
    // Since teacher is not linked to course/section in current schema,
    // we'll need to find a teacher from the department
    // For now, we'll set it to null or find the first teacher in the department
    const teacher = await Teacher.findOne({ department: student.department });
    if (!teacher) {
      return NextResponse.json(
        { success: false, message: "Teacher not found for this course" },
        { status: 404 }
      );
    }

    // Check if evaluation already exists for this student, semester, and course
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
          { success: false, message: "Evaluation already submitted for this course" },
          { status: 400 }
        );
      }

      // Add new evaluation to existing document
      evaluation.evaluations.push({
        teacher: teacher._id,
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
            teacher: teacher._id,
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

    await evaluation.save();

    // Update student's evaluations array
    const evaluationRef = {
      type: evaluation._id,
      semester: semester,
    };

    // Check if this evaluation reference already exists
    const existingEvaluationRef = student.evaluations.find(
      (evalRef) => evalRef.type.toString() === evaluation._id.toString() && evalRef.semester === semester
    );

    if (!existingEvaluationRef) {
      student.evaluations.push(evaluationRef);
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

