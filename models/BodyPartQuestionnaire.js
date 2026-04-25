// ================================
// models/BodyPartQuestionnaire.js
// ================================
const mongoose = require("mongoose");

const optionSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: true,
      trim: true,
    },
    value: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false },
);

const questionSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: ["text", "number", "mcq-single", "mcq-multiple"],
      default: "text",
    },

    required: {
      type: Boolean,
      default: true,
    },

    options: {
      type: [optionSchema],
      default: [],
    },
  },
  { timestamps: false },
);

const bodyPartQuestionnaireSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    bodyPart: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Body",
      required: true,
      index: true,
    },

    questions: {
      type: [questionSchema],
      default: [],
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model(
  "BodyPartQuestionnaire",
  bodyPartQuestionnaireSchema,
);
