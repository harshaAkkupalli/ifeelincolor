const express = require("express");
const router = express.Router();
const {
  getQuestionsByBodyPart,
  saveSelectedQuestions,
  getPatientSelectedQuestions,
  getPatientSelectionByBodyPart,
} = require("../controllers/bodyPartController");

// Get all body parts

// Get questions for a specific body part
router.get("/:bodyPartId/questions", getQuestionsByBodyPart);

// Save selected questions for a patient (patientId in params)
router.post("/patient/:patientId/save-questions", saveSelectedQuestions);

// Get all selected questions for a patient (patientId in params)
router.get("/patient/:patientId/selections", getPatientSelectedQuestions);

// Get specific patient's selection for a body part (patientId in params)
router.get(
  "/patient/:patientId/body-part/:bodyPartId",
  getPatientSelectionByBodyPart,
);

module.exports = router;
