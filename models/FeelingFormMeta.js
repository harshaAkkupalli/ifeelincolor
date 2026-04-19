// models/FeelingFormMeta.js
const mongoose = require("mongoose");

const feelingFormMetaSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: "Feelings Wheel",
    },
    prompt: {
      type: String,
      default: "How are you feeling today?",
    },
    primaryQuestion: {
      type: String,
      default: "How are you feeling today?",
    },
    secondaryQuestionTemplate: {
      type: String,
      default: "What type of '{parent}' feeling are you feeling?",
    },
    tertiaryQuestionTemplate: {
      type: String,
      default: "Which type of '{parent}' feeling are you feeling?",
    },
  },
  {
    timestamps: true,
  },
);

// Ensure only one document exists
feelingFormMetaSchema.statics.getSingleton = async function () {
  let doc = await this.findOne();
  if (!doc) {
    doc = await this.create({});
  }
  return doc;
};

module.exports = mongoose.model("FeelingFormMeta", feelingFormMetaSchema);
