// models/BodyPartQuestionnaire.js
const mongoose = require("mongoose");

const bodyPartQuestionnaireSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    bodyPart: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Body",
      required: true,
    },
    questions: [
      {
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
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model(
  "BodyPartQuestionnaire",
  bodyPartQuestionnaireSchema,
);
