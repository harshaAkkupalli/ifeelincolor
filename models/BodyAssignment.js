const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Voice metadata schema for TTS configuration
const voiceMetaSchema = new Schema({
    language: {
        type: String,
        default: 'en-US'
    },
    voiceStyle: {
        type: String,
        enum: ['male', 'female', 'neutral'],
        default: 'neutral'
    },
    speechRate: {
        type: Number,
        min: 0.5,
        max: 2.0,
        default: 1.0
    },
    volume: {
        type: Number,
        min: 0,
        max: 1,
        default: 1.0
    }
}, { _id: false });

// Final Option schema (Level 3 - exactly 2 required)
const finalOptionSchema = new Schema({
    hex: {
        type: String,
        required: true,
        match: /^#([0-9A-F]{3}){1,2}$/i,
        trim: true
    },
    feeling: {
        type: String,
        required: true,
        maxlength: 100,
        trim: true
    },
    voiceText: {
        type: String,
        maxlength: 300,
        trim: true
    },
    voiceMeta: voiceMetaSchema,
    audioFile: {
        type: String, // URL or file path
        default: null
    },
    generatedTtsUrl: {
        type: String, // URL to generated TTS audio
        default: null
    },
    hasAudio: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Sub-Feeling schema (Level 2 - up to 10 per main color)
const subFeelingSchema = new Schema({
    hex: {
        type: String,
        required: true,
        match: /^#([0-9A-F]{3}){1,2}$/i,
        trim: true
    },
    subFeeling: {
        type: String,
        required: true,
        maxlength: 100,
        trim: true
    },
    voiceText: {
        type: String,
        maxlength: 300,
        trim: true
    },
    voiceMeta: voiceMetaSchema,
    audioFile: {
        type: String,
        default: null
    },
    generatedTtsUrl: {
        type: String,
        default: null
    },
    hasAudio: {
        type: Boolean,
        default: false
    },
    finalOptions: {
        type: [finalOptionSchema],
        validate: {
            validator: function(options) {
                return options.length === 0 || options.length === 2;
            },
            message: 'Final options must be exactly 2 or empty'
        }
    }
}, { timestamps: true });

// Main Color schema (Level 1)
const mainColorSchema = new Schema({
    hex: {
        type: String,
        required: true,
        match: /^#([0-9A-F]{3}){1,2}$/i,
        trim: true
    },
    feeling: {
        type: String,
        required: true,
        maxlength: 100,
        trim: true
    },
    voiceText: {
        type: String,
        maxlength: 300,
        trim: true
    },
    voiceMeta: voiceMetaSchema,
    audioFile: {
        type: String,
        default: null
    },
    generatedTtsUrl: {
        type: String,
        default: null
    },
    hasAudio: {
        type: Boolean,
        default: false
    },
    subFeelings: {
        type: [subFeelingSchema],
        validate: {
            validator: function(feelings) {
                return feelings.length <= 10;
            },
            message: 'Cannot have more than 10 sub-feelings per main color'
        },
        default: []
    }
}, { timestamps: true });

// Body Assignment schema (Top level)
const bodyAssignmentSchema = new Schema({
    title: {
        type: String,
        required: true,
        maxlength: 200,
        trim: true
    },
    description: {
        type: String,
        maxlength: 1000,
        trim: true
    },
    mainColors: {
        type: [mainColorSchema],
        default: []
    },
    version: {
        type: Number,
        default: 1
    },
    published: {
        type: Boolean,
        default: false
    },
    publishedAt: {
        type: Date,
        default: null
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'Admin',
        required: false
    },
    lastEditedBy: {
        type: Schema.Types.ObjectId,
        ref: 'Admin',
        required: false
    }
}, { 
    timestamps: true 
});

// Indexes for search and filtering
bodyAssignmentSchema.index({ title: 'text', description: 'text' });
bodyAssignmentSchema.index({ published: 1, createdAt: -1 });
bodyAssignmentSchema.index({ 'mainColors.hex': 1 });

// Virtual for counting main colors
bodyAssignmentSchema.virtual('mainColorCount').get(function() {
    return this.mainColors ? this.mainColors.length : 0;
});

// Method to validate unique hex colors within main colors
bodyAssignmentSchema.methods.validateUniqueMainColors = function() {
    const hexValues = this.mainColors.map(c => c.hex.toLowerCase());
    const uniqueHex = new Set(hexValues);
    return hexValues.length === uniqueHex.size;
};

// Method to validate unique hex colors within sub-feelings of a main color
mainColorSchema.methods.validateUniqueSubFeelings = function() {
    const hexValues = this.subFeelings.map(sf => sf.hex.toLowerCase());
    const uniqueHex = new Set(hexValues);
    return hexValues.length === uniqueHex.size;
};

// Method to validate unique hex colors within final options of a sub-feeling
subFeelingSchema.methods.validateUniqueFinalOptions = function() {
    const hexValues = this.finalOptions.map(fo => fo.hex.toLowerCase());
    const uniqueHex = new Set(hexValues);
    return hexValues.length === uniqueHex.size;
};

// Pre-save hook to update publishedAt
bodyAssignmentSchema.pre('save', function(next) {
    if (this.isModified('published') && this.published && !this.publishedAt) {
        this.publishedAt = new Date();
    }
    next();
});

const BodyAssignment = mongoose.model('BodyAssignment', bodyAssignmentSchema);

module.exports = BodyAssignment;







