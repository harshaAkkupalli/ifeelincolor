const BodyPartQuestionnaire = require("../models/BodyPartQuestionnaire");
const PatientSelectedQuestions = require("../models/PatientSelectedQuestions");

// Get questions for a specific body part
const getQuestionsByBodyPart = async (req, res) => {
  try {
    const { bodyPartId } = req.params;

    // Find questionnaire for this body part
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
          questions: questionnaire.questions,
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

// Save selected questions for a patient (patientId from params)
const saveSelectedQuestions = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { bodyPartId, questionnaireId, selectedQuestions, bodyPartName } =
      req.body;

    // Validate required fields
    if (!patientId) {
      return res.status(400).json({
        status: "error",
        message: "Patient ID is required in params",
      });
    }

    if (!bodyPartId || !questionnaireId) {
      return res.status(400).json({
        status: "error",
        message: "Missing required fields: bodyPartId and questionnaireId",
      });
    }

    if (!bodyPartName) {
      return res.status(400).json({
        status: "error",
        message: "Missing required field: bodyPartName",
      });
    }

    // Check if questionnaire exists
    const questionnaire = await BodyPartQuestionnaire.findById(questionnaireId);
    if (!questionnaire) {
      return res.status(404).json({
        status: "error",
        message: "Questionnaire not found",
      });
    }

    // If selectedQuestions provided, filter them, otherwise save all questions
    let questionsToSave = questionnaire.questions;
    if (selectedQuestions && selectedQuestions.length > 0) {
      questionsToSave = questionnaire.questions.filter((q) =>
        selectedQuestions.includes(q._id.toString()),
      );
    }

    // Prepare the data to save
    const selectedQuestionsData = {
      patientId: patientId,
      bodyPartId: bodyPartId,
      bodyPartName: bodyPartName,
      questionnaireId: questionnaireId,
      questionnaireTitle: questionnaire.title,
      selectedQuestions: questionsToSave.map((q) => ({
        questionId: q._id,
        text: q.text,
        type: q.type,
        required: q.required,
      })),
      selectedAt: new Date(),
    };

    // Check if patient already has selected questions for this body part
    let existingRecord = await PatientSelectedQuestions.findOne({
      patientId: patientId,
      bodyPartId: bodyPartId,
      questionnaireId: questionnaireId,
    });

    let savedRecord;
    if (existingRecord) {
      // Update existing record
      existingRecord.selectedQuestions =
        selectedQuestionsData.selectedQuestions;
      existingRecord.selectedAt = new Date();
      savedRecord = await existingRecord.save();
    } else {
      // Create new record
      const patientSelectedQuestions = new PatientSelectedQuestions(
        selectedQuestionsData,
      );
      savedRecord = await patientSelectedQuestions.save();
    }

    res.status(200).json({
      status: "success",
      data: {
        id: savedRecord._id,
        patientId: savedRecord.patientId,
        bodyPart: {
          id: bodyPartId,
          name: bodyPartName,
        },
        questionnaire: {
          id: questionnaire._id,
          title: questionnaire.title,
        },
        selectedQuestions: questionsToSave,
        totalQuestions: questionsToSave.length,
        selectedAt: savedRecord.selectedAt,
      },
      message: existingRecord
        ? "Questions updated successfully"
        : "Questions selected and saved successfully",
    });
  } catch (error) {
    console.error("Error saving selected questions:", error);
    res.status(500).json({
      status: "error",
      message: "An error occurred while saving selected questions",
    });
  }
};

// Get patient's selected questions (patientId from params)
const getPatientSelectedQuestions = async (req, res) => {
  try {
    const { patientId } = req.params;

    if (!patientId) {
      return res.status(400).json({
        status: "error",
        message: "Patient ID is required in params",
      });
    }

    const patientSelections = await PatientSelectedQuestions.find({
      patientId: patientId,
    }).sort({ selectedAt: -1 });

    if (!patientSelections || patientSelections.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "No selected questions found for this patient",
      });
    }

    res.status(200).json({
      status: "success",
      data: patientSelections,
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

// Get specific patient's selection for a body part (patientId from params)
const getPatientSelectionByBodyPart = async (req, res) => {
  try {
    const { patientId, bodyPartId } = req.params;

    if (!patientId || !bodyPartId) {
      return res.status(400).json({
        status: "error",
        message: "Patient ID and Body Part ID are required in params",
      });
    }

    const selection = await PatientSelectedQuestions.findOne({
      patientId: patientId,
      bodyPartId: bodyPartId,
    });

    if (!selection) {
      return res.status(404).json({
        status: "error",
        message: "No selection found for this patient and body part",
      });
    }

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

module.exports = {
  getQuestionsByBodyPart,
  saveSelectedQuestions,
  getPatientSelectedQuestions,
  getPatientSelectionByBodyPart,
};
