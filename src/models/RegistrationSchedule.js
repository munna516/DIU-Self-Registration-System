import mongoose from "mongoose";
import { Schema } from "mongoose";

const registrationScheduleSchema = new Schema(
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
      unique: true, // One schedule per department
    },
    isEnabled: {
      type: Boolean,
      default: false,
      required: true,
    },
    startDate: {
      type: Date,
      required: function () {
        return this.isEnabled;
      },
    },
    endDate: {
      type: Date,
      required: function () {
        return this.isEnabled;
      },
    },
    startTime: {
      type: String, // Format: "HH:MM" (24-hour format)
      required: function () {
        return this.isEnabled;
      },
    },
    endTime: {
      type: String, // Format: "HH:MM" (24-hour format)
      required: function () {
        return this.isEnabled;
      },
    },
  },
  { timestamps: true }
);

export default mongoose.models.RegistrationSchedule ||
  mongoose.model("RegistrationSchedule", registrationScheduleSchema);

