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

module.exports = router;
