// ===============================================
// models/PatientFeelingAnswers.js
// ===============================================
const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema(
  {
    key: String, // selected node key
    label: String, // selected label
    type: {
      type: String,
      enum: ["primary", "secondary", "tertiary"],
    },
    question: String,
    answer: String,
    colorGroup: String,
    hexCode: {
      inner: String,
      middle: String,
      outer: String,
    },
  },
  { _id: false },
);

const patientFeelingAnswersSchema = new mongoose.Schema(
  {
    patientId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    bodyPartName: {
      type: String,
      default: "",
    },

    selectedParts: [
      {
        partId: String,
        partName: String,
      },
    ],

    answers: {
      type: [answerSchema],
      default: [],
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model(
  "PatientFeelingAnswers",
  patientFeelingAnswersSchema,
);
