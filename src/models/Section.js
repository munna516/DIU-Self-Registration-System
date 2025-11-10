import mongoose from "mongoose";
import { Schema } from "mongoose";

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
        "Level-1-Term-1",
        "Level-1-Term-2",
        "Level-2-Term-1",
        "Level-2-Term-2",
        "Level-3-Term-1",
        "Level-3-Term-2",
        "Level-4-Term-1",
        "Level-4-Term-2",
      ],
      required: true,
    },
    count: {
      type: Number,
      required: true,
      min: 1,
      max: 30,
    },
  },
  { timestamps: true }
);

// Ensure unique combination of department and level
sectionSchema.index({ department: 1, level: 1 }, { unique: true });

export default mongoose.models.Section ||
  mongoose.model("Section", sectionSchema);

