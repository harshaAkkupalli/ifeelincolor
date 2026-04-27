// ====================================
// controllers/bodyQuestionnaire.js
// ====================================
const mongoose = require("mongoose");
const BodyPartQuestionnaire = require("../models/BodyPartQuestionnaire");
const PatientSelectedQuestions = require("../models/PatientSelectedQuestions");
const PatientFeelingAnswers = require("../models/PatientFeelingAnswers");
const FeelingNode = require("../models/feelingsWheel");
const Patient = require("../models/patient");

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

const saveOrUpdateFeelingAnswers = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { selectedParts, bodyPartName, answers } = req.body;

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

    const formattedAnswers = answers.map((item) => ({
      key: item.key,
      label: item.label,
      type: item.type,
      question: item.question,
      answer: item.answer,
      colorGroup: item.colorGroup || "",
      hexCode: item.hexCode || {},
    }));

    const saved = await PatientFeelingAnswers.findOneAndUpdate(
      { patientId },
      {
        $set: {
          patientId,
          selectedParts: selectedParts || [],
          bodyPartName: bodyPartName || "",
          answers: formattedAnswers,
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
      message: "Feeling answers saved successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// const getPatientConditionResult = async (req, res) => {
//   try {
//     const { patientId } = req.params;

//     if (!patientId) {
//       return res.status(400).json({
//         status: "error",
//         message: "patientId required",
//       });
//     }

//     const [bodyData, feelingData] = await Promise.all([
//       PatientSelectedQuestions.findOne({ patientId }).lean(),
//       PatientFeelingAnswers.findOne({ patientId }).lean(),
//     ]);

//     const bodyAnswers = bodyData?.answers || [];
//     const feelingAnswers = feelingData?.answers || [];

//     // -------------------------
//     // Detect symptoms
//     // -------------------------
//     const yesSymptoms = bodyAnswers.filter((item) =>
//       ["yes", "true"].includes(String(item.answer).toLowerCase()),
//     );

//     const symptomCount = yesSymptoms.length;

//     // -------------------------
//     // Detect emotions
//     // -------------------------
//     const emotionLabels = feelingAnswers.map((item) => item.label);

//     const stressEmotions = [
//       "Angry",
//       "Depressed",
//       "Anxious",
//       "Scared",
//       "Frustrated",
//       "Worried",
//     ];

//     const hasStressEmotion = emotionLabels.some((e) =>
//       stressEmotions.includes(e),
//     );

//     // -------------------------
//     // Final Output Defaults
//     // -------------------------
//     let patientCondition = "Stable";
//     let severity = "Low";
//     let colorCode = "#000000"; // Black
//     let colorName = "Black";
//     let aboutCondition =
//       "Your current responses indicate a generally stable physical and emotional condition with no major concerns detected.";

//     // -------------------------
//     // Rules
//     // -------------------------
//     if (symptomCount >= 3) {
//       patientCondition = "Physical Discomfort";
//       severity = "Medium";
//       colorCode = "#F59E0B";
//       colorName = "Amber";
//       aboutCondition =
//         "Your answers suggest moderate physical discomfort. Some symptoms may need attention, rest, hydration, and monitoring.";
//     }

//     if (symptomCount >= 5) {
//       patientCondition = "Needs Medical Attention";
//       severity = "High";
//       colorCode = "#ba2f24"; // Red
//       colorName = "Red";
//       aboutCondition =
//         "Multiple physical symptoms were detected. It is advisable to consult a healthcare professional for proper evaluation soon.";
//     }

//     if (hasStressEmotion) {
//       patientCondition = "Emotional Stress";
//       severity = "Medium";
//       colorCode = "#961cca"; // Pink
//       colorName = "Purple";
//       aboutCondition =
//         "Your emotional responses suggest noticeable stress. Relaxation, support, and healthy coping strategies may be helpful now.";
//     }

//     if (symptomCount >= 3 && hasStressEmotion) {
//       patientCondition = "High Stress with Physical Symptoms";
//       severity = "High";
//       colorCode = "#ba2f24"; // Red
//       colorName = "Dark Red";
//       aboutCondition =
//         "Both emotional stress and physical symptoms are present. A balanced focus on mental and physical wellbeing is recommended.";
//     }

//     return res.status(200).json({
//       status: "success",
//       patientId,
//       result: {
//         patientCondition,
//         severity,
//         colorCode,
//         colorName,
//         aboutCondition,
//       },
//       message: "Patient condition generated successfully",
//     });
//   } catch (error) {
//     return res.status(500).json({
//       status: "error",
//       message: error.message,
//     });
//   }
// };

// const getPatientConditionResult = async (req, res) => {
//   try {
//     const { patientId } = req.params;

//     if (!patientId) {
//       return res.status(400).json({
//         status: "error",
//         message: "patientId required",
//       });
//     }

//     // =========================================
//     // FETCH DATA
//     // =========================================
//     const [patient, bodyData, feelingData] = await Promise.all([
//       Patient.findById(patientId).lean(),
//       PatientSelectedQuestions.findOne({ patientId }).lean(),
//       PatientFeelingAnswers.findOne({ patientId }).lean(),
//     ]);

//     if (!patient) {
//       return res.status(404).json({
//         status: "error",
//         message: "Patient not found",
//       });
//     }

//     const patientName = patient.userName || "Patient";

//     const bodyAnswers = bodyData?.answers || [];
//     const feelingAnswers = feelingData?.answers || [];

//     // =========================================
//     // BODY PAIN / YES ANSWERS
//     // =========================================
//     const yesSymptoms = bodyAnswers.filter((item) =>
//       ["yes", "true"].includes(String(item.answer).toLowerCase()),
//     );

//     const painPart =
//       feelingData?.bodyPartName ||
//       feelingData?.selectedParts?.[0]?.partName ||
//       "body";

//     // =========================================
//     // FEELINGS
//     // =========================================
//     const primaryFeeling =
//       feelingAnswers.find((x) => x.type === "primary") || null;

//     const secondaryFeeling =
//       feelingAnswers.find((x) => x.type === "secondary") || null;

//     const tertiaryFeeling =
//       feelingAnswers.find((x) => x.type === "tertiary") || null;

//     const feelingName =
//       tertiaryFeeling?.label ||
//       secondaryFeeling?.label ||
//       primaryFeeling?.label ||
//       "Unclear";

//     const topFeeling =
//       primaryFeeling?.label ||
//       secondaryFeeling?.label ||
//       tertiaryFeeling?.label ||
//       "Neutral";

//     // =========================================
//     // COLOR FROM FEELING
//     // =========================================
//     const colorCode =
//       tertiaryFeeling?.hexCode?.inner ||
//       secondaryFeeling?.hexCode?.inner ||
//       primaryFeeling?.hexCode?.inner ||
//       "#000000";

//     const colorMap = {
//       "#000000": "Black",
//       "#081844": "Blue",
//       "#ba2f24": "Red",
//       "#BA2F24": "Red",
//       "#961cca": "Purple",
//       "#961CCA": "Purple",
//       "#8c4622": "Brown",
//       "#8C4622": "Brown",
//       "#6f0fe3": "Indigo",
//       "#F59E0B": "Amber",
//       "#f59e0b": "Amber",
//     };

//     const colorName = colorMap[colorCode] || "Unknown";

//     // =========================================
//     // CONDITION
//     // =========================================
//     let patientCondition = "Stable";
//     let severity = "Low";

//     if (yesSymptoms.length >= 3) {
//       patientCondition = "Physical Discomfort";
//       severity = "Medium";
//     }

//     if (yesSymptoms.length >= 5) {
//       patientCondition = "Needs Medical Attention";
//       severity = "High";
//     }

//     // =========================================
//     // MESSAGE
//     // =========================================
//     const aboutCondition = `Hey ${patientName}, you are feeling pain in your ${painPart} because you feel ${feelingName}, which indicates you are ${topFeeling}.`;

//     // =========================================
//     // RESPONSE
//     // =========================================
//     return res.status(200).json({
//       status: "success",
//       patientId,
//       result: {
//         patientCondition,
//         severity,
//         colorCode,
//         colorName,
//         bodyPartName: painPart,
//         feelingName,
//         topFeeling,
//         aboutCondition,
//       },
//       message: "Patient condition generated successfully",
//     });
//   } catch (error) {
//     return res.status(500).json({
//       status: "error",
//       message: error.message,
//     });
//   }
// };

const getPatientConditionResult = async (req, res) => {
  try {
    const { patientId } = req.params;

    if (!patientId) {
      return res.status(400).json({
        status: "error",
        message: "patientId required",
      });
    }

    // =====================================
    // FETCH DATA
    // =====================================
    const [patient, bodyData, feelingData] = await Promise.all([
      Patient.findById(patientId).lean(),
      PatientSelectedQuestions.findOne({ patientId }).lean(),
      PatientFeelingAnswers.findOne({ patientId }).lean(),
    ]);

    if (!patient) {
      return res.status(404).json({
        status: "error",
        message: "Patient not found",
      });
    }

    // =====================================
    // PATIENT NAME
    // =====================================
    const patientName = patient.userName || "Patient";

    // =====================================
    // BODY PART
    // =====================================
    const bodyPartName =
      feelingData?.bodyPartName ||
      feelingData?.selectedParts?.[0]?.partName ||
      "body";

    // =====================================
    // PAIN COUNT
    // =====================================
    const painCount =
      bodyData?.answers?.filter((x) =>
        ["yes", "true"].includes(String(x.answer).toLowerCase()),
      ).length || 0;

    // =====================================
    // PRIMARY FEELING
    // =====================================
    const primaryFeeling = feelingData?.answers?.[0]?.answer || "Neutral";

    // =====================================
    // FIXED COLOR MAP
    // =====================================
    const feelingColors = {
      Happy: "#FFD700",
      Sad: "#1E90FF",
      Disgusted: "#808080",
      Angry: "#FF0000",
      Fearful: "#FF8C00",
      Bad: "#00A36C",
      Surprised: "#8A2BE2",
    };

    const colorCode = feelingColors[primaryFeeling] || "#000000";

    // =====================================
    // CONDITION
    // =====================================
    let patientCondition = "Stable";
    let severity = "Low";

    if (painCount >= 3) {
      patientCondition = "Pain Detected";
      severity = "Medium";
    }

    if (painCount >= 5) {
      patientCondition = "High Pain";
      severity = "High";
    }

    // =====================================
    // MESSAGE
    // =====================================
    const aboutCondition = `Hey ${patientName}, you are feeling pain in your ${bodyPartName} because you feel ${primaryFeeling}.`;

    // =====================================
    // RESPONSE
    // =====================================
    return res.status(200).json({
      status: "success",
      patientId,
      result: {
        patientName,
        bodyPartName,
        topFeeling: primaryFeeling,
        colorCode,
        patientCondition,
        severity,
        aboutCondition,
      },
      message: "Patient condition generated successfully",
    });
  } catch (error) {
    return res.status(500).json({
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
  saveOrUpdateFeelingAnswers,
  getPatientConditionResult,
};
