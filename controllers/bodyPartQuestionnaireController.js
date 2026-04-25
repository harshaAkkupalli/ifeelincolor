// ====================================
// controllers/bodyQuestionnaire.js
// ====================================
const mongoose = require("mongoose");
const BodyPartQuestionnaire = require("../models/BodyPartQuestionnaire");
const PatientSelectedQuestions = require("../models/PatientSelectedQuestions");

// ====================================
// Create Questionnaire
// POST /bodytest/create
// ====================================
const createQuestionnaire = async (req, res) => {
  try {
    const { title, description, bodyPart, bodyPartId, questions } = req.body;

    // support both bodyPart and bodyPartId
    const finalBodyPart = bodyPart || bodyPartId;

    // validations
    if (!title?.trim()) {
      return res.status(400).json({
        status: "error",
        message: "title is required",
      });
    }

    if (!finalBodyPart) {
      return res.status(400).json({
        status: "error",
        message: "bodyPart is required",
      });
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "questions must be a non-empty array",
      });
    }

    // validate questions
    const formattedQuestions = questions.map((q, index) => {
      if (!q.text?.trim()) {
        throw new Error(`Question text required at index ${index}`);
      }

      const type = q.type || "text";

      return {
        text: q.text.trim(),
        type,
        required: q.required ?? true,
        options:
          type === "mcq-single" || type === "mcq-multiple"
            ? (q.options || []).map((opt) => ({
                label: opt.label,
                value: opt.value,
              }))
            : [],
      };
    });

    const created = await BodyPartQuestionnaire.create({
      title: title.trim(),
      description: description?.trim() || "",
      bodyPart: finalBodyPart,
      questions: formattedQuestions,
    });

    res.status(201).json({
      status: "success",
      body: created,
      message: "Questionnaire created successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// ====================================
// Update Questionnaire
// PUT /bodytest/:id
// ====================================
const updateQuestionnaire = async (req, res) => {
  try {
    const updated = await BodyPartQuestionnaire.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    );

    if (!updated) {
      return res.status(404).json({
        status: "error",
        message: "Questionnaire not found",
      });
    }

    res.json({
      status: "success",
      body: updated,
      message: "Updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

const getAllQuestions = async (req, res) => {
  try {
    const data = await BodyPartQuestionnaire.find({ isActive: true })
      .populate("bodyPart", "partName")
      .sort({ createdAt: -1 })
      .lean();

    const formatted = data.map((item) => ({
      questionnaireId: item._id,
      title: item.title,
      description: item.description,
      bodyPartId: item.bodyPart?._id || item.bodyPart,
      bodyPartName: item.bodyPart?.partName || "",
      questions: item.questions.map((q) => ({
        questionId: q._id,
        text: q.text,
        type: q.type,
        required: q.required,
        options: q.options || [],
      })),
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));

    return res.status(200).json({
      status: "success",
      data: {
        total: formatted.length,
        questions: formatted,
      },
      message: "All questions retrieved successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// ====================================
// Get Questions By Body Parts
// POST /bodytest/questions
// body: { bodyPartIds: [] }
// ====================================
const getQuestionsByBodyParts = async (req, res) => {
  try {
    const { bodyPartIds } = req.body;

    if (!Array.isArray(bodyPartIds) || bodyPartIds.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "bodyPartIds must be non-empty array",
      });
    }

    const data = await BodyPartQuestionnaire.find({
      bodyPart: { $in: bodyPartIds },
      isActive: true,
    })
      .populate("bodyPart", "name")
      .lean();

    const formatted = data.map((item) => ({
      questionnaireId: item._id,
      title: item.title,
      description: item.description,
      bodyPartId: item.bodyPart?._id || item.bodyPart,
      bodyPartName: item.bodyPart?.name || "",
      questions: item.questions.map((q) => ({
        questionId: q._id,
        text: q.text,
        type: q.type,
        required: q.required,
        options: q.options || [],
      })),
    }));

    res.json({
      status: "success",
      data: {
        total: formatted.length,
        questions: formatted,
      },
      message: "Questions retrieved successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// ====================================
// Submit Answers
// POST /bodytest/take
// ====================================
const saveOrUpdateAnswers = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { answers } = req.body;

    if (!patientId) {
      return res.status(400).json({
        status: "error",
        message: "patientId required",
      });
    }

    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "answers required",
      });
    }

    // Get all matching questions
    const questionnaires = await BodyPartQuestionnaire.find({
      "questions._id": {
        $in: answers.map((a) => new mongoose.Types.ObjectId(a.questionId)),
      },
    }).lean();

    const finalAnswers = [];

    for (const item of answers) {
      for (const form of questionnaires) {
        const found = form.questions.find(
          (q) => q._id.toString() === item.questionId,
        );

        if (found) {
          finalAnswers.push({
            questionnaireId: form._id,
            questionId: found._id,
            question: found.text,
            type: found.type,
            answer: item.answer,
          });
        }
      }
    }

    if (finalAnswers.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "Invalid questionIds provided",
      });
    }

    // Create if not exists, update if exists
    const saved = await PatientSelectedQuestions.findOneAndUpdate(
      { patientId },
      {
        $set: {
          patientId,
          answers: finalAnswers,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      },
    );

    return res.status(200).json({
      status: "success",
      body: saved,
      message: "Answers saved successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// ====================================
// Get Patient Answers
// GET /bodytest/patient/:patientId
// ====================================
const getPatientAnswers = async (req, res) => {
  try {
    const data = await PatientSelectedQuestions.find({
      patientId: req.params.patientId,
    }).sort({ createdAt: -1 });

    res.json({
      status: "success",
      body: data,
      message: "Patient answers fetched successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

module.exports = {
  createQuestionnaire,
  updateQuestionnaire,
  getQuestionsByBodyParts,
  submitAnswers: saveOrUpdateAnswers,
  getPatientAnswers,
  getAllQuestions,
};
