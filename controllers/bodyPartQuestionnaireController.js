// controllers/bodyPartQuestionnaireController.js
const BodyPartQuestionnaire = require("../models/BodyPartQuestionnaire");

// Get all questionnaires (with optional bodyPart filter)
const listQuestionnaires = async (req, res) => {
  try {
    const { bodyPart, isActive } = req.query;
    const filter = {};

    if (bodyPart) filter.bodyPart = bodyPart;
    if (isActive) filter.isActive = isActive === "true";

    const questionnaires = await BodyPartQuestionnaire.find(filter)
      .populate("bodyPart", "partName description")
      .sort({ createdAt: -1 });

    res.json({ status: "success", body: questionnaires });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// Get single questionnaire
const getQuestionnaire = async (req, res) => {
  try {
    const questionnaire = await BodyPartQuestionnaire.findById(
      req.params.id,
    ).populate("bodyPart", "partName description");

    if (!questionnaire) {
      return res.status(404).json({ status: "error", message: "Not found" });
    }

    res.json({ status: "success", body: questionnaire });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// Create questionnaire
const createQuestionnaire = async (req, res) => {
  try {
    const { title, description, bodyPart, questions, isActive } = req.body;

    const questionnaire = await BodyPartQuestionnaire.create({
      title,
      description,
      bodyPart,
      questions: questions || [],
      isActive: isActive !== undefined ? isActive : true,
    });

    await questionnaire.populate("bodyPart", "partName description");

    res.status(201).json({ status: "success", body: questionnaire });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// Update questionnaire
const updateQuestionnaire = async (req, res) => {
  try {
    const { title, description, bodyPart, questions, isActive } = req.body;

    const questionnaire = await BodyPartQuestionnaire.findById(req.params.id);
    if (!questionnaire) {
      return res.status(404).json({ status: "error", message: "Not found" });
    }

    if (title !== undefined) questionnaire.title = title;
    if (description !== undefined) questionnaire.description = description;
    if (bodyPart !== undefined) questionnaire.bodyPart = bodyPart;
    if (questions !== undefined) questionnaire.questions = questions;
    if (isActive !== undefined) questionnaire.isActive = isActive;

    await questionnaire.save();
    await questionnaire.populate("bodyPart", "partName description");

    res.json({ status: "success", body: questionnaire });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// Delete questionnaire
const deleteQuestionnaire = async (req, res) => {
  try {
    const questionnaire = await BodyPartQuestionnaire.findById(req.params.id);
    if (!questionnaire) {
      return res.status(404).json({ status: "error", message: "Not found" });
    }

    await questionnaire.deleteOne();
    res.json({ status: "success", message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

module.exports = {
  listQuestionnaires,
  getQuestionnaire,
  createQuestionnaire,
  updateQuestionnaire,
  deleteQuestionnaire,
};
