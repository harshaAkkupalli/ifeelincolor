// routes/feelingsWheelRoutes.js
const express = require("express");
const router = express.Router();
const { adminAuth } = require("../middleware/adminAuth");
const {
  getFeelingsWheel,
  listNodes,
  createNode,
  updateNode,
  deleteNode,
  getMeta,
  updateMeta,
  previewForm,
} = require("../controllers/feelingsWheelController");
const {
  listQuestionnaires,
  getQuestionnaire,
  createQuestionnaire,
  updateQuestionnaire,
  deleteQuestionnaire,
  toggleQuestionnaireStatus,
  reorderQuestionnaires,
  getFeelingQuestionsByQuestionnaireId,
} = require("../controllers/feelingQuestionnaireController");

// ============ PUBLIC ROUTES (No Auth) ============
router.get("/", getFeelingsWheel);

// ============ ADMIN ROUTES (Requires Auth) ============
// Nodes management
router.get("/admin/feelings-wheel/nodes", adminAuth, listNodes);
router.post("/admin/feelings-wheel/nodes", adminAuth, createNode);
router.put("/admin/feelings-wheel/nodes/:id", adminAuth, updateNode);
router.delete("/admin/feelings-wheel/nodes/:id", adminAuth, deleteNode);

// Meta management
router.get("/admin/feelings-wheel/meta", adminAuth, getMeta);
router.put("/admin/feelings-wheel/meta", adminAuth, updateMeta);

// Form preview
router.get("/admin/feelings-wheel/form", adminAuth, previewForm);

router.get("/admin/feeling-questionnaire", adminAuth, listQuestionnaires);
router.get("/admin/feeling-questionnaire/:id", adminAuth, getQuestionnaire);
router.post("/admin/feeling-questionnaire", adminAuth, createQuestionnaire);
router.put("/admin/feeling-questionnaire/:id", adminAuth, updateQuestionnaire);
router.delete(
  "/admin/feeling-questionnaire/:id",
  adminAuth,
  deleteQuestionnaire,
);
router.patch(
  "/admin/feeling-questionnaire/:id/toggle-status",
  adminAuth,
  toggleQuestionnaireStatus,
);
router.post(
  "/admin/feeling-questionnaire/reorder",
  adminAuth,
  reorderQuestionnaires,
);
router.get(
  "/admin/feeling-questionnaire/questions/:id",

  getFeelingQuestionsByQuestionnaireId,
);

module.exports = router;
