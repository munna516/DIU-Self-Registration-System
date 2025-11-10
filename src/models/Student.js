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
        type: mongoose.Schema.Types.ObjectId,
        ref: "Evaluation",
      },
    ],

    registeredCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "RegisterCourse",
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

export default mongoose.models.Student ||
  mongoose.model("Student", studentSchema);
