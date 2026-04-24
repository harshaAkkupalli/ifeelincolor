// controllers/bodyPartController.js
const BodyPartQuestionnaire = require("../models/BodyPartQuestionnaire");
const PatientSelectedQuestions = require("../models/PatientSelectedQuestions");

// Get questions for a specific body part
const getQuestionsByBodyPart = async (req, res) => {
  try {
    const { bodyPartId } = req.params;

    const questionnaire = await BodyPartQuestionnaire.findOne({
      bodyPart: bodyPartId,
      isActive: true,
    }).populate("bodyPart", "partName description");

    if (!questionnaire) {
      return res.status(404).json({
        status: "error",
        message: "No questionnaire found for this body part",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        questionnaire: {
          id: questionnaire._id,
          title: questionnaire.title,
          description: questionnaire.description,
          bodyPart: questionnaire.bodyPart,
          questions: questionnaire.questions.map((q) => ({
            id: q._id,
            text: q.text,
            type: q.type,
            required: q.required,
          })),
        },
      },
      message: "Questions retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(500).json({
      status: "error",
      message: "An error occurred while fetching questions",
    });
  }
};

// Save selected questions for multiple body parts
const saveSelectedQuestions = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { selections } = req.body;

    if (!patientId) {
      return res.status(400).json({
        status: "error",
        message: "Patient ID is required in params",
      });
    }

    if (!selections || !Array.isArray(selections) || selections.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "Selections array is required with at least one body part",
      });
    }

    // Process each selection
    const processedSelections = [];

    for (const selection of selections) {
      const { bodyPartId, bodyPartName, questionnaireId, answers } = selection;

      if (!bodyPartId || !questionnaireId || !answers) {
        return res.status(400).json({
          status: "error",
          message:
            "Each selection must have bodyPartId, questionnaireId, and answers",
        });
      }

      // Check if questionnaire exists
      const questionnaire =
        await BodyPartQuestionnaire.findById(questionnaireId);
      if (!questionnaire) {
        return res.status(404).json({
          status: "error",
          message: `Questionnaire not found for body part: ${bodyPartName}`,
        });
      }

      // Process answers
      const processedAnswers = answers.map((answer) => ({
        questionId: answer.questionId,
        question: answer.question,
        answer: answer.answer,
        type: answer.type || "text",
        score: answer.score || 0,
        category: answer.category || "",
        mcqOptions: answer.mcqOptions || [],
        media: answer.media || "",
      }));

      processedSelections.push({
        bodyPartId,
        bodyPartName,
        questionnaireId,
        questionnaireTitle: questionnaire.title,
        selectedQuestions: processedAnswers,
        selectedAt: new Date(),
      });
    }

    // Find or create patient record
    let patientRecord = await PatientSelectedQuestions.findOne({ patientId });

    if (patientRecord) {
      // Update existing selections or add new ones
      for (const newSelection of processedSelections) {
        const existingIndex = patientRecord.selections.findIndex(
          (s) => s.bodyPartId.toString() === newSelection.bodyPartId.toString(),
        );

        if (existingIndex !== -1) {
          // Update existing body part selection
          patientRecord.selections[existingIndex] = newSelection;
        } else {
          // Add new body part selection
          patientRecord.selections.push(newSelection);
        }
      }
      await patientRecord.save();
    } else {
      // Create new patient record
      patientRecord = new PatientSelectedQuestions({
        patientId,
        selections: processedSelections,
      });
      await patientRecord.save();
    }

    res.status(200).json({
      status: "success",
      data: patientRecord,
      message: "Selections saved successfully",
    });
  } catch (error) {
    console.error("Error saving selected questions:", error);
    res.status(500).json({
      status: "error",
      message: "An error occurred while saving selected questions",
    });
  }
};

// Get patient's all selections
const getPatientSelectedQuestions = async (req, res) => {
  try {
    const { patientId } = req.params;

    if (!patientId) {
      return res.status(400).json({
        status: "error",
        message: "Patient ID is required in params",
      });
    }

    const patientRecord = await PatientSelectedQuestions.findOne({
      patientId: patientId,
    });

    if (!patientRecord) {
      return res.status(404).json({
        status: "error",
        message: "No selections found for this patient",
      });
    }

    res.status(200).json({
      status: "success",
      data: patientRecord,
      message: "Patient selections retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching patient selections:", error);
    res.status(500).json({
      status: "error",
      message: "An error occurred while fetching patient selections",
    });
  }
};

// Get patient's selection for specific body part
const getPatientSelectionByBodyPart = async (req, res) => {
  try {
    const { patientId, bodyPartId } = req.params;

    if (!patientId || !bodyPartId) {
      return res.status(400).json({
        status: "error",
        message: "Patient ID and Body Part ID are required in params",
      });
    }

    const patientRecord = await PatientSelectedQuestions.findOne({
      patientId: patientId,
      "selections.bodyPartId": bodyPartId,
    });

    if (!patientRecord) {
      return res.status(404).json({
        status: "error",
        message: "No selection found for this patient and body part",
      });
    }

    const selection = patientRecord.selections.find(
      (s) => s.bodyPartId.toString() === bodyPartId,
    );

    res.status(200).json({
      status: "success",
      data: selection,
      message: "Patient selection retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching patient selection:", error);
    res.status(500).json({
      status: "error",
      message: "An error occurred while fetching patient selection",
    });
  }
};

const getAllQuestions = async (req, res) => {
  try {
    const assessments = await BodyPartQuestionnaire.find();

    if (!assessments || assessments.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "No questions found",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        total: assessments.length,
        questions: assessments,
      },
      message: "All questions retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching all questions:", error);
    res.status(500).json({
      status: "error",
      message: "An error occurred while fetching questions",
    });
  }
};

module.exports = {
  getQuestionsByBodyPart,
  saveSelectedQuestions,
  getPatientSelectedQuestions,
  getPatientSelectionByBodyPart,
  getAllQuestions,
};
