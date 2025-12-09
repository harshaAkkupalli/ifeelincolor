const mongoose = require('mongoose');

// Define the schema for Sub-Sub Colors (Deep Feelings)
const subSubColorSchema = new mongoose.Schema({
    subColorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubColor',
        required: true
    },
    name: {
        type: String,
        required: true
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

// Create and export the SubSubColor model
const SubSubColor = mongoose.models.SubSubColor || mongoose.model('SubSubColor', subSubColorSchema);

module.exports = SubSubColor;







