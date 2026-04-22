// routes/bodyPartQuestionnaireRoutes.js
const express = require("express");
const router = express.Router();
const { adminAuth } = require("../middleware/adminAuth");
const {
  listQuestionnaires,
  getQuestionnaire,
  createQuestionnaire,
  updateQuestionnaire,
  deleteQuestionnaire,
} = require("../controllers/bodyPartQuestionnaireController");

router.get("/admin/body-part-questionnaires", listQuestionnaires);
router.get("/admin/body-part-questionnaires/:id", getQuestionnaire);
router.post("/admin/body-part-questionnaires", createQuestionnaire);
router.put(
  "/admin/body-part-questionnaires/:id",
  adminAuth,
  updateQuestionnaire,
);
router.delete(
  "/admin/body-part-questionnaires/:id",
  adminAuth,
  deleteQuestionnaire,
);

module.exports = router;
