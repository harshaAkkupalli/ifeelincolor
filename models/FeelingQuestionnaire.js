// models/FeelingQuestionnaire.js
const mongoose = require("mongoose");

const feelingQuestionnaireSchema = new mongoose.Schema(
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
    },
    feelingNodeKey: {
      type: String,
      required: true,
      trim: true,
    },
    mainColor: {
      type: String,
      default: "#FF6B6B",
      match: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
    },
    displayLevel: {
      type: String,
      enum: ["full", "primary", "secondary", "tertiary"],
      default: "full",
    },
    customQuestion: {
      type: String,
      trim: true,
      default: "",
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for better query performance
feelingQuestionnaireSchema.index({ feelingNodeKey: 1 });
feelingQuestionnaireSchema.index({ bodyPart: 1 });
feelingQuestionnaireSchema.index({ isActive: 1, order: 1 });
feelingQuestionnaireSchema.index({ createdAt: -1 });

module.exports = mongoose.model(
  "FeelingQuestionnaire",
  feelingQuestionnaireSchema,
);
