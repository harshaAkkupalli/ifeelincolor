// ====================================
// models/PatientSelectedQuestions.js
// ====================================
const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema(
  {
    questionnaireId: mongoose.Schema.Types.ObjectId,

    questionId: mongoose.Schema.Types.ObjectId,

    question: String,

    type: String,

    answer: mongoose.Schema.Types.Mixed,
  },
  { _id: false },
);

const patientSelectedQuestionsSchema = new mongoose.Schema(
  {
    patientId: {
      type: String,
      required: true,
      index: true,
    },

    answers: {
      type: [answerSchema],
      default: [],
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model(
  "PatientSelectedQuestions",
  patientSelectedQuestionsSchema,
);
