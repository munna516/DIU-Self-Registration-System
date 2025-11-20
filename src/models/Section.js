import mongoose from "mongoose";
const { Schema } = mongoose;

const sectionSchema = new Schema(
  {
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
    count: {
      type: Number,
      required: true,
      min: 1,
      max: 30,
    },
    sectionType: {
      type: String,
      enum: ["regular", "retake"],
      required: true,
    },
    sections: [
      {
        name: { type: String, required: true }, // e.g., A, A1, A2
        capacity: { type: Number, required: true },
        students: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

sectionSchema.index({ department: 1, level: 1, sectionType: 1 }, { unique: true });

export default mongoose.models.Section || mongoose.model("Section", sectionSchema);
