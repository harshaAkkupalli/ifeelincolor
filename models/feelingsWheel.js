// models/FeelingNode.js
const mongoose = require("mongoose");

const feelingNodeSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    label: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["primary", "secondary", "tertiary"],
      required: true,
    },
    parentKey: {
      type: String,
      default: null,
    },
    colorGroup: {
      type: String,
      enum: [
        "yellow",
        "blue",
        "grey",
        "red",
        "orange",
        "green",
        "purple",
        null,
      ],
      default: null,
    },
    hexCode: {
      inner: { type: String, default: null },
      middle: { type: String, default: null },
      outer: { type: String, default: null },
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    nextQuestionKey: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// Index for faster queries
feelingNodeSchema.index({ parentKey: 1, order: 1 });
feelingNodeSchema.index({ key: 1, type: 1 });
feelingNodeSchema.index({ isActive: 1, type: 1 });

// Virtual for getting children
feelingNodeSchema.virtual("children", {
  ref: "FeelingNode",
  localField: "key",
  foreignField: "parentKey",
});

module.exports = mongoose.model("FeelingNode", feelingNodeSchema);
