// routes/patientHistoryRoutes.js

const express = require("express");
const router = express.Router();
const { adminAuth } = require("../middleware/adminAuth");

const {
  createQuestion,
  getQuestions,
  updateQuestion,
  deleteQuestion,
} = require("../controllers/patientHistoryController");

router.post("/", adminAuth, createQuestion);
router.get("/", getQuestions);
router.put("/:id", adminAuth, updateQuestion);
router.delete("/:id", adminAuth, deleteQuestion);

module.exports = router;
