const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Simple Emotion Card Schema
const emotionCardSchema = new Schema({
    emotionName: {
        type: String,
        required: true
    },
    color: {
        type: String,
        required: true
    },
    // Optional: Store hierarchical data if needed
    hierarchy: {
        type: Object,
        default: null
    },
    // Track who created it
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'Admin',
        default: null
    }
}, {
    timestamps: true // Automatically add createdAt and updatedAt
});

const EmotionCard = mongoose.model('EmotionCard', emotionCardSchema);

module.exports = EmotionCard;

