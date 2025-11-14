import mongoose from "mongoose";
import { Schema } from "mongoose";

const semesterSchema = new Schema(
  {
    semester: {
      type: String,
      required: true,
      enum: ["Fall", "Spring", "Summer"],
    },
    year: {
      type: Number,
      required: true,
      min: 2020,
      max: 2100,
    },
  },
  { timestamps: true }
);

// Static method to get the single semester record
semesterSchema.statics.getCurrent = async function () {
  let semester = await this.findOne();
  if (!semester) {
    // Create default semester if none exists
    const currentYear = new Date().getFullYear();
    semester = await this.create({
      semester: "Fall",
      year: currentYear,
    });
  }
  return semester;
};

// Static method to update the single semester record
semesterSchema.statics.updateCurrent = async function (data) {
  let semester = await this.findOne();
  if (!semester) {
    // Create if doesn't exist
    semester = await this.create(data);
  } else {
    // Update existing
    semester.semester = data.semester;
    semester.year = data.year;
    await semester.save();
  }
  return semester;
};

export default mongoose.models.Semester || mongoose.model("Semester", semesterSchema);

