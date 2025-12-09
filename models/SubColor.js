const mongoose = require('mongoose');

// Define the schema for Sub-Colors (Emotional Shades)
const subColorSchema = new mongoose.Schema({
    colorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Color',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    hexCode: {
        type: String,
        match: /^#([0-9A-F]{3}){1,2}$/i // Validate hex color format (optional)
    },
    description: {
        type: String,
        required: true
    },
    narration: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

// Create and export the SubColor model
const SubColor = mongoose.models.SubColor || mongoose.model('SubColor', subColorSchema);

module.exports = SubColor;







