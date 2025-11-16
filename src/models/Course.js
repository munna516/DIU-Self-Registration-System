import mongoose from "mongoose";
import { Schema } from "mongoose";

const courseSchema = new Schema(
  {
    courseCode: String,
    courseTitle: String,
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
    level: {
      type: String,
      enum: [
        "L1T1",
        "L1T2",
        "L1T3",
        "L2T1",
        "L2T2",
        "L2T3",
        "L3T1",
        "L3T2",
        "L3T3",
        "L4T1",
        "L4T2",
        "L4T3",
      ],
      required: true,
    },
    courseType: {
      type: String,
      enum: ["Theory", "Lab"],
      required: true,
    },
    credit: Number,
    prerequisite: [String],
  },
  { timestamps: true }
);

export default mongoose.models.Course || mongoose.model("Course", courseSchema);
