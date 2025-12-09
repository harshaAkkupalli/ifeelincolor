const EmotionCard = require('../models/EmotionCard');

// Create an emotion card
const createEmotionCard = async (req, res) => {
    try {
        const { emotionName, color, hierarchy } = req.body;

        // Validation
        if (!emotionName || !emotionName.trim()) {
            return res.status(400).json({
                status: 'error',
                body: null,
                message: 'Emotion name is required'
            });
        }

        if (!color || !color.trim()) {
            return res.status(400).json({
                status: 'error',
                body: null,
                message: 'Color is required'
            });
        }

        const newEmotionCard = new EmotionCard({
            emotionName: emotionName.trim(),
            color: color.trim(),
            hierarchy: hierarchy || null,
            createdBy: req.user?.id || null
        });

        await newEmotionCard.save();

        res.status(201).json({
            status: 'success',
            body: newEmotionCard,
            message: 'Emotion card created successfully'
        });
    } catch (error) {
        console.error('Error creating emotion card:', error);
        
        res.status(500).json({
            status: 'error',
            body: null,
            message: `Error creating emotion card: ${error.message}`
        });
    }
};

// Get all emotion cards
const getAllEmotionCards = async (req, res) => {
    try {
        const emotionCards = await EmotionCard.find({}).sort({ createdAt: -1 });
        
        res.json({
            status: 'success',
            body: emotionCards,
            message: 'Emotion cards retrieved successfully'
        });
    } catch (error) {
        console.error('Error fetching emotion cards:', error);
        res.status(500).json({
            status: 'error',
            body: null,
            message: 'Error fetching emotion cards'
        });
    }
};

// Get emotion card by ID
const getEmotionCardById = async (req, res) => {
    try {
        const emotionCard = await EmotionCard.findById(req.params.id);
        
        if (!emotionCard) {
            return res.status(404).json({
                status: 'error',
                body: null,
                message: 'Emotion card not found'
            });
        }
        
        res.json({
            status: 'success',
            body: emotionCard,
            message: 'Emotion card retrieved successfully'
        });
    } catch (error) {
        console.error('Error fetching emotion card:', error);
        res.status(500).json({
            status: 'error',
            body: null,
            message: 'Error fetching emotion card'
        });
    }
};

// Update emotion card
const updateEmotionCard = async (req, res) => {
    try {
        const { emotionName, color, hierarchy } = req.body;
        
        const updateData = {};
        if (emotionName) updateData.emotionName = emotionName.trim();
        if (color) updateData.color = color.trim();
        if (hierarchy !== undefined) updateData.hierarchy = hierarchy;
        
        const updatedEmotionCard = await EmotionCard.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );
        
        if (!updatedEmotionCard) {
            return res.status(404).json({
                status: 'error',
                body: null,
                message: 'Emotion card not found'
            });
        }
        
        res.json({
            status: 'success',
            body: updatedEmotionCard,
            message: 'Emotion card updated successfully'
        });
    } catch (error) {
        console.error('Error updating emotion card:', error);
        res.status(500).json({
            status: 'error',
            body: null,
            message: 'Error updating emotion card'
        });
    }
};

// Delete emotion card
const deleteEmotionCard = async (req, res) => {
    try {
        const emotionCard = await EmotionCard.findById(req.params.id);
        
        if (!emotionCard) {
            return res.status(404).json({
                status: 'error',
                body: null,
                message: 'Emotion card not found'
            });
        }
        
        await emotionCard.deleteOne();
        
        res.json({
            status: 'success',
            body: null,
            message: 'Emotion card deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting emotion card:', error);
        res.status(500).json({
            status: 'error',
            body: null,
            message: 'Error deleting emotion card'
        });
    }
};

module.exports = {
    createEmotionCard,
    getAllEmotionCards,
    getEmotionCardById,
    updateEmotionCard,
    deleteEmotionCard
};

