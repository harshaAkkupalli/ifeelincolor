const express = require('express');
const router = express.Router();
const ttsController = require('../controllers/ttsController');
const { verifyToken } = require('../middleware/auth');
const { adminAuth } = require('../middleware/adminAuth');

// Apply authentication middleware
const authMiddleware = adminAuth;

// Generate TTS audio from text
router.post('/generate', authMiddleware, ttsController.generateTTS);

// Upload audio file
router.post('/upload', authMiddleware, ttsController.audioUpload.single('audio'), ttsController.uploadAudio);

// Delete audio file
router.delete('/delete', authMiddleware, ttsController.deleteAudio);

// Get available voices for a language
router.get('/voices', authMiddleware, ttsController.getAvailableVoices);

// Get supported languages
router.get('/languages', authMiddleware, ttsController.getSupportedLanguages);

// Validate voice text
router.post('/validate', authMiddleware, ttsController.validateVoiceText);

module.exports = router;

