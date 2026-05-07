// models/PatientHistoryQuestion.js

const mongoose = require("mongoose");

const PatientHistoryQuestionSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: ["treatmentHistory", "socialInformation", "medicalHistory"],
      required: true,
    },
    question: {
      type: String,
      required: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model(
  "PatientHistoryQuestion",
  PatientHistoryQuestionSchema,
);
