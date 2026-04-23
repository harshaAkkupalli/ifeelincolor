const mongoose = require("mongoose");

const patientSelectedQuestionsSchema = new mongoose.Schema(
  {
    patientId: {
      type: String,
      required: true,
      index: true,
    },
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
    selectedQuestions: [
      {
        questionId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
        text: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          enum: ["text", "number"],
          default: "text",
        },
        required: {
          type: Boolean,
          default: true,
        },
      },
    ],
    selectedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// Compound index to ensure unique combination of patient, body part, and questionnaire
patientSelectedQuestionsSchema.index(
  { patientId: 1, bodyPartId: 1, questionnaireId: 1 },
  { unique: true },
);

module.exports = mongoose.model(
  "PatientSelectedQuestions",
  patientSelectedQuestionsSchema,
);
