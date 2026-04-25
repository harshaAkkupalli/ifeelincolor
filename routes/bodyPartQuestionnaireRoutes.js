// routes/bodyPartQuestionnaireRoutes.js
const express = require("express");
const router = express.Router();
const { adminAuth } = require("../middleware/adminAuth");
const {
  createQuestionnaire,
  updateQuestionnaire,
  getQuestionsByBodyParts,
  submitAnswers,
  getAllQuestions,
} = require("../controllers/bodyPartQuestionnaireController");

router.post("/body-part-questionnaires", getQuestionsByBodyParts);
router.post("/admin/body-part-questionnaires", createQuestionnaire);
router.post("/submit-body-part-questionnaires/:patientId", submitAnswers);
router.get("/admin/body-part-questionnaires", getAllQuestions);

router.put(
  "/admin/body-part-questionnaires/:id",
  adminAuth,
  updateQuestionnaire,
);
// router.delete(
//   "/admin/body-part-questionnaires/:id",
//   adminAuth,
//   deleteQuestionnaire,
// );

module.exports = router;
