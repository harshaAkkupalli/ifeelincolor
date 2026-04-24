// models/PatientSelectedQuestions.js
const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  question: {
    type: String,
    required: true,
  },
  answer: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  type: {
    type: String,
    enum: ["text", "number", "mcq"],
    default: "text",
  },
  score: {
    type: Number,
    default: 0,
  },
  category: {
    type: String,
    default: "",
  },
  mcqOptions: [
    {
      text: String,
      isCorrect: Boolean,
    },
  ],
  media: {
    type: String,
    default: "",
  },
});

const patientSelectedQuestionsSchema = new mongoose.Schema(
  {
    patientId: {
      type: String,
      required: true,
      index: true,
    },
    selections: [
      {
        bodyPartId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Body",
          required: true,
        },
        bodyPartName: {
          type: String,
          required: true,
        },
        questionnaireId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "BodyPartQuestionnaire",
          required: true,
        },
        questionnaireTitle: {
          type: String,
          required: true,
        },
        selectedQuestions: [answerSchema],
        selectedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model(
  "PatientSelectedQuestions",
  patientSelectedQuestionsSchema,
);
