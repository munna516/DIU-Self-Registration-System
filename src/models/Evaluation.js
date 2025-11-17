import { Schema } from "mongoose";
import mongoose from "mongoose";

const evaluationSchema = new Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    semester: { type: String, required: true },
    evaluations: [
      {
        course: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Course",
          required: true,
        },
        answers: [
          {
            questionNo: Number,
            questionText: String,
            rating: {
              type: String,
              enum: [
                "Below Average",
                "Average",
                "Good",
                "Very Good",
                "Excellent",
              ],
              required: true,
            },
          },
        ],
      },
    ],
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.Evaluation ||
  mongoose.model("Evaluation", evaluationSchema);
