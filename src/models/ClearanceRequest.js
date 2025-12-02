import mongoose from "mongoose";
import { Schema } from "mongoose";

const clearanceRequestSchema = new Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
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
    semester: {
        type: String,
        required: true,
    },
    requestStatus: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        required: true,
        default: "pending",
    },
});

export default mongoose.models.ClearanceRequest || mongoose.model("ClearanceRequest", clearanceRequestSchema);