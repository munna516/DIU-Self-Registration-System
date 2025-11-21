import mongoose from "mongoose";
const { Schema } = mongoose;

const studentSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    studentId: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      enum: [
        "CSE",
        "SWE",
        "CIS",
        "EEE",
        "CE",
        "TE",
        "ARC",
        "ICE",
        "LAW",
        "ENG",
        "JMC",
        "BBA",
        "THM",
        "IE",
        "PH",
        "NFE",
        "GEB",
      ],
      required: true,
    },
    batch: {
      type: String,
      required: true,
    },

    evaluations: [
      {
        type: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Evaluation",
          required: true,
        },
        semester: {
          type: String,
          required: true,
        },
      },
    ],

    registeredCourses: [
      {
        type: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "RegisterCourse",
          required: true,
        },
        semester: {
          type: String,
          required: true,
        },
      },
    ],

    isVerified: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { timestamps: true }
);

// Add indexes for frequently queried fields
studentSchema.index({ studentId: 1 }, { unique: true });
studentSchema.index({ email: 1 }, { unique: true });

export default mongoose.models.Student ||
  mongoose.model("Student", studentSchema);
