const express = require('express');
const { adminAuth } = require('../middleware/adminAuth');
const {
    createSubSubColor,
    getAllSubSubColors,
    getSubSubColorById,
    updateSubSubColor,
    deleteSubSubColor
} = require('../controllers/subSubColorController');

const router = express.Router();

// Create a new sub-sub-color (Admin only)
router.post('/subsubcolors', adminAuth, createSubSubColor);

// Get all sub-sub-colors (optionally filtered by subColorId query param)
router.get('/subsubcolors', getAllSubSubColors);

// Get a specific sub-sub-color by ID
router.get('/subsubcolors/:id', getSubSubColorById);

// Update a sub-sub-color by ID (Admin only)
router.put('/subsubcolors/:id', adminAuth, updateSubSubColor);

// Delete a sub-sub-color by ID (Admin only)
router.delete('/subsubcolors/:id', adminAuth, deleteSubSubColor);

module.exports = router;







