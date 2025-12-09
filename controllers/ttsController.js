const ttsService = require('../services/ttsService');
const cloudinary = require('../config/cloudinary');
const multer = require('multer');
const path = require('path');

// Configure multer for audio file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/audio/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'audio-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const audioUpload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /mp3|wav|ogg|m4a/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only audio files (mp3, wav, ogg, m4a) are allowed'));
        }
    }
});

/**
 * Generate TTS audio from text
 */
const generateTTS = async (req, res) => {
    try {
        const { text, language, voiceStyle, speechRate, volume } = req.body;

        if (!text) {
            return res.status(400).json({
                status: 'error',
                body: null,
                message: 'Text is required for TTS generation'
            });
        }

        // Validate voice text
        const validation = ttsService.validateVoiceText(text);
        if (!validation.isValid) {
            return res.status(400).json({
                status: 'error',
                body: null,
                message: validation.message
            });
        }

        const options = {
            language: language || 'en-US',
            voiceStyle: voiceStyle || 'neutral',
            speechRate: speechRate || 1.0,
            volume: volume || 1.0
        };

        const audioUrl = await ttsService.generateTTS(text, options);

        res.json({
            status: 'success',
            body: {
                audioUrl,
                text,
                options
            },
            message: 'TTS audio generated successfully'
        });
    } catch (error) {
        console.error('Error generating TTS:', error);
        res.status(500).json({
            status: 'error',
            body: null,
            message: error.message || 'An error occurred while generating TTS audio'
        });
    }
};

/**
 * Upload audio file
 */
const uploadAudio = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                status: 'error',
                body: null,
                message: 'No audio file provided'
            });
        }

        // If Cloudinary is configured, upload to Cloudinary
        if (cloudinary && cloudinary.uploader) {
            try {
                const result = await cloudinary.uploader.upload(req.file.path, {
                    resource_type: 'video', // Cloudinary uses 'video' for audio files
                    folder: 'body-assignments/audio',
                    format: 'mp3'
                });

                // Delete local file after upload
                const fs = require('fs');
                if (fs.existsSync(req.file.path)) {
                    fs.unlinkSync(req.file.path);
                }

                return res.json({
                    status: 'success',
                    body: {
                        audioUrl: result.secure_url,
                        publicId: result.public_id,
                        duration: result.duration,
                        format: result.format
                    },
                    message: 'Audio file uploaded successfully'
                });
            } catch (cloudinaryError) {
                console.error('Cloudinary upload error:', cloudinaryError);
                // Fall through to local file response
            }
        }

        // Return local file URL if Cloudinary is not configured or failed
        const audioUrl = `/uploads/audio/${req.file.filename}`;
        
        res.json({
            status: 'success',
            body: {
                audioUrl,
                filename: req.file.filename,
                size: req.file.size,
                mimetype: req.file.mimetype
            },
            message: 'Audio file uploaded successfully'
        });
    } catch (error) {
        console.error('Error uploading audio:', error);
        res.status(500).json({
            status: 'error',
            body: null,
            message: 'An error occurred while uploading the audio file'
        });
    }
};

/**
 * Delete audio file
 */
const deleteAudio = async (req, res) => {
    try {
        const { audioUrl, publicId } = req.body;

        if (!audioUrl && !publicId) {
            return res.status(400).json({
                status: 'error',
                body: null,
                message: 'Audio URL or public ID is required'
            });
        }

        // If it's a Cloudinary URL, delete from Cloudinary
        if (publicId && cloudinary && cloudinary.uploader) {
            try {
                await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
            } catch (cloudinaryError) {
                console.error('Cloudinary delete error:', cloudinaryError);
            }
        }

        // If it's a local TTS file, delete it
        if (audioUrl && audioUrl.includes('/tts-audio/')) {
            await ttsService.deleteTTSAudio(audioUrl);
        }

        // If it's a local uploaded file, delete it
        if (audioUrl && audioUrl.includes('/uploads/audio/')) {
            const fs = require('fs');
            const filePath = path.join(__dirname, '..', audioUrl);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        res.json({
            status: 'success',
            body: null,
            message: 'Audio file deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting audio:', error);
        res.status(500).json({
            status: 'error',
            body: null,
            message: 'An error occurred while deleting the audio file'
        });
    }
};

/**
 * Get available voices for a language
 */
const getAvailableVoices = async (req, res) => {
    try {
        const { language } = req.query;
        const voices = ttsService.getAvailableVoices(language);

        res.json({
            status: 'success',
            body: voices,
            message: 'Available voices retrieved successfully'
        });
    } catch (error) {
        console.error('Error getting available voices:', error);
        res.status(500).json({
            status: 'error',
            body: null,
            message: 'An error occurred while retrieving available voices'
        });
    }
};

/**
 * Get supported languages
 */
const getSupportedLanguages = async (req, res) => {
    try {
        const languages = ttsService.getSupportedLanguages();

        res.json({
            status: 'success',
            body: languages,
            message: 'Supported languages retrieved successfully'
        });
    } catch (error) {
        console.error('Error getting supported languages:', error);
        res.status(500).json({
            status: 'error',
            body: null,
            message: 'An error occurred while retrieving supported languages'
        });
    }
};

/**
 * Validate voice text
 */
const validateVoiceText = async (req, res) => {
    try {
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({
                status: 'error',
                body: null,
                message: 'Text is required for validation'
            });
        }

        const validation = ttsService.validateVoiceText(text);

        res.json({
            status: 'success',
            body: validation,
            message: 'Voice text validated'
        });
    } catch (error) {
        console.error('Error validating voice text:', error);
        res.status(500).json({
            status: 'error',
            body: null,
            message: 'An error occurred while validating voice text'
        });
    }
};

module.exports = {
    generateTTS,
    uploadAudio,
    deleteAudio,
    getAvailableVoices,
    getSupportedLanguages,
    validateVoiceText,
    audioUpload // Export multer middleware
};







