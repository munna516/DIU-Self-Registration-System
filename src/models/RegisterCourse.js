import { Schema } from "mongoose";
import mongoose from "mongoose";

const registerCourseSchema = new Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    semester: { type: String, required: true }, // e.g., "Fall 2025"
    courses: [
      {
        course: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Course",
          required: true,
        },
        section: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Section",
          required: true,
        },
        status: {
          type: String,
          enum: ["enrolled", "completed", "failed"],
          required: true,
          default: "enrolled",
        },
      },
    ],
    registeredAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.RegisterCourse ||
  mongoose.model("RegisterCourse", registerCourseSchema);
