const express = require('express');
const router = express.Router();
const bodyAssignmentController = require('../controllers/bodyAssignmentController');
const { verifyToken } = require('../middleware/auth');
const { adminAuth } = require('../middleware/adminAuth');

// Apply authentication middleware to all routes
// Use adminAuth for admin-only access, fallback to verifyToken
const authMiddleware = adminAuth;

// ==================== ASSIGNMENT ROUTES ====================

// Get all assignments (with search/filter)
router.get('/', authMiddleware, bodyAssignmentController.getAllBodyAssignments);

// Get single assignment by ID
router.get('/:id', authMiddleware, bodyAssignmentController.getBodyAssignmentById);

// Create new assignment
router.post('/', authMiddleware, bodyAssignmentController.createBodyAssignment);

// Update assignment (title, description, published status)
router.put('/:id', authMiddleware, bodyAssignmentController.updateBodyAssignment);

// Delete assignment
router.delete('/:id', authMiddleware, bodyAssignmentController.deleteBodyAssignment);

// Duplicate assignment
router.post('/:id/duplicate', authMiddleware, bodyAssignmentController.duplicateBodyAssignment);

// ==================== MAIN COLOR ROUTES ====================

// Add main color to assignment
router.post('/:id/main-colors', authMiddleware, bodyAssignmentController.addMainColor);

// Update main color
router.put('/:assignmentId/main-colors/:colorId', authMiddleware, bodyAssignmentController.updateMainColor);

// Delete main color
router.delete('/:assignmentId/main-colors/:colorId', authMiddleware, bodyAssignmentController.deleteMainColor);

// ==================== SUB-FEELING ROUTES ====================

// Add sub-feeling to main color
router.post('/:assignmentId/main-colors/:colorId/sub-feelings', authMiddleware, bodyAssignmentController.addSubFeeling);

// Update sub-feeling
router.put('/:assignmentId/main-colors/:colorId/sub-feelings/:subFeelingId', authMiddleware, bodyAssignmentController.updateSubFeeling);

// Delete sub-feeling
router.delete('/:assignmentId/main-colors/:colorId/sub-feelings/:subFeelingId', authMiddleware, bodyAssignmentController.deleteSubFeeling);

// ==================== FINAL OPTIONS ROUTES ====================

// Set final options (exactly 2)
router.post('/:assignmentId/main-colors/:colorId/sub-feelings/:subFeelingId/final-options', authMiddleware, bodyAssignmentController.setFinalOptions);

// Update single final option
router.put('/:assignmentId/main-colors/:colorId/sub-feelings/:subFeelingId/final-options/:optionId', authMiddleware, bodyAssignmentController.updateFinalOption);

// ==================== PREVIEW & PUBLISH ROUTES ====================

// Get preview data
router.get('/:id/preview', authMiddleware, bodyAssignmentController.getPreviewData);

// Publish assignment
router.post('/:id/publish', authMiddleware, bodyAssignmentController.publishAssignment);

// Unpublish assignment
router.post('/:id/unpublish', authMiddleware, bodyAssignmentController.unpublishAssignment);

module.exports = router;

