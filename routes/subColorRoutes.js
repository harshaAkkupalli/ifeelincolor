const express = require('express');
const { adminAuth } = require('../middleware/adminAuth');
const {
    createSubColor,
    getAllSubColors,
    getSubColorById,
    updateSubColor,
    deleteSubColor
} = require('../controllers/subColorController');

const router = express.Router();

// Create a new sub-color (Admin only)
router.post('/subcolors', adminAuth, createSubColor);

// Get all sub-colors (optionally filtered by colorId query param)
router.get('/subcolors', getAllSubColors);

// Get a specific sub-color by ID
router.get('/subcolors/:id', getSubColorById);

// Update a sub-color by ID (Admin only)
router.put('/subcolors/:id', adminAuth, updateSubColor);

// Delete a sub-color by ID (Admin only)
router.delete('/subcolors/:id', adminAuth, deleteSubColor);

module.exports = router;







