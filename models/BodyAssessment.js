const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the BodyAssessment Schema
const bodyAssessmentSchema = new Schema({
    question: {
        type: String,
        required: true
    },
    answer: {
        type: String,
        required: false,
        default: ''
    },
    type: {
        type: String,
        enum: ['mcq', 'blanks'],
        required: true
    },
    score: {
        type: Number,
        required: false,
        default: 0
    },
    part: {
        type: Schema.Types.ObjectId,
        ref: 'Body', // Referencing the Body model
        required: false,
        default: null
    },
    media: {
        type: String,
        default: null,
    },
    mcqOptions: [{
        text: { type: String, required: false },
        color: { type: String, required: false }, // Color hex value
        narration: { type: String, required: false }, // Voice-over text
        isCorrect: { type: Boolean, default: false },
        // Hierarchical emotion structure for color-based emotion selection
        emotionHierarchy: {
            primary: {
                id: { type: String },
                name: { type: String },
                color: { type: String }
            },
            secondary: {
                id: { type: String },
                name: { type: String },
                color: { type: String }
            },
            tertiary: {
                id: { type: String },
                name: { type: String },
                color: { type: String },
                description: { type: String }
            }
        }
    }],
    // New fields for linked questions
    questionLevel: {
        type: Number,
        default: 1, // 1 = main question, 2 = linked question
        enum: [1, 2]
    },
    linkedToColorId: {
        type: String, // ID of the color option this question is linked to
        default: null
    },
    // Main color and feeling for card display
    mainColor: {
        type: String, // Hex color value
        default: null
    },
    mainFeeling: {
        type: String, // Main feeling/emotion name
        default: null
    }
});

const BodyAssessment = mongoose.model('BodyAssessment', bodyAssessmentSchema);

module.exports = BodyAssessment;
