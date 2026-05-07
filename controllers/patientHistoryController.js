// controllers/patientHistoryController.js

const PatientHistoryQuestion = require("../models/PatientHistoryQuestion");

// CREATE
const createQuestion = async (req, res) => {
  try {
    const { category, question } = req.body;

    if (!category || !question) {
      return res.status(400).json({
        status: "error",
        message: "Category and question are required",
      });
    }

    const newQuestion = await PatientHistoryQuestion.create({
      category,
      question,
    });

    res.status(201).json({
      status: "success",
      body: newQuestion,
      message: "Question created successfully",
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// GET
const getQuestions = async (req, res) => {
  try {
    const { category } = req.query;

    let filter = { isActive: true };
    if (category) filter.category = category;

    const questions = await PatientHistoryQuestion.find(filter).lean();

    const grouped = questions.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push({
        _id: item._id,
        question: item.question,
      });
      return acc;
    }, {});

    res.json({
      status: "success",
      body: grouped,
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// UPDATE
const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await PatientHistoryQuestion.findById(id);
    if (!existing) {
      return res.status(404).json({
        status: "error",
        message: "Question not found",
      });
    }

    const updated = await PatientHistoryQuestion.findByIdAndUpdate(
      id,
      req.body,
      { new: true },
    );
    console.log("REQ BODY:", req.body);
    // Check if actually changed
    if (JSON.stringify(existing) === JSON.stringify(updated)) {
      return res.json({
        status: "warning",
        message: "No changes detected",
      });
    }

    res.json({
      status: "success",
      body: updated,
      message: "Updated successfully",
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// DELETE (Soft Delete)
const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await PatientHistoryQuestion.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true },
    );

    if (!deleted) {
      return res.status(404).json({
        status: "error",
        message: "Question not found",
      });
    }

    res.json({
      status: "success",
      message: "Deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

module.exports = {
  createQuestion,
  getQuestions,
  updateQuestion,
  deleteQuestion,
};
