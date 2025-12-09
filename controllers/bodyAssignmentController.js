const BodyAssignment = require('../models/BodyAssignment');

// ==================== ASSIGNMENT CRUD ====================

// Get all body assignments with search and filter
const getAllBodyAssignments = async (req, res) => {
    try {
        const { search, published, sortBy = 'updatedAt', order = 'desc' } = req.query;
        
        let query = {};
        
        // Text search on title and description
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        
        // Filter by published status
        if (published !== undefined) {
            query.published = published === 'true';
        }
        
        // Build sort object
        const sortOrder = order === 'desc' ? -1 : 1;
        const sort = { [sortBy]: sortOrder };
        
        const assignments = await BodyAssignment.find(query)
            .sort(sort)
            .populate('createdBy', 'name email')
            .populate('lastEditedBy', 'name email')
            .lean();
        
        // Add computed fields
        const enrichedAssignments = assignments.map(assignment => ({
            ...assignment,
            mainColorCount: assignment.mainColors ? assignment.mainColors.length : 0
        }));
        
        res.json({
            status: 'success',
            body: enrichedAssignments,
            message: 'Body Assignments retrieved successfully'
        });
    } catch (error) {
        console.error('Error fetching body assignments:', error);
        res.status(500).json({
            status: 'error',
            body: null,
            message: 'An error occurred while retrieving body assignments'
        });
    }
};

// Get single body assignment by ID
const getBodyAssignmentById = async (req, res) => {
    try {
        const assignment = await BodyAssignment.findById(req.params.id)
            .populate('createdBy', 'name email')
            .populate('lastEditedBy', 'name email');
        
        if (!assignment) {
            return res.status(404).json({
                status: 'error',
                body: null,
                message: 'Body Assignment not found'
            });
        }
        
        res.json({
            status: 'success',
            body: assignment,
            message: 'Body Assignment retrieved successfully'
        });
    } catch (error) {
        console.error('Error fetching body assignment:', error);
        res.status(500).json({
            status: 'error',
            body: null,
            message: 'An error occurred while retrieving the body assignment'
        });
    }
};

// Create new body assignment
const createBodyAssignment = async (req, res) => {
    try {
        const { title, description } = req.body;
        
        if (!title) {
            return res.status(400).json({
                status: 'error',
                body: null,
                message: 'Title is required'
            });
        }
        
        const newAssignment = new BodyAssignment({
            title,
            description,
            mainColors: [],
            createdBy: req.user ? req.user._id : null,
            lastEditedBy: req.user ? req.user._id : null
        });
        
        await newAssignment.save();
        
        res.status(201).json({
            status: 'success',
            body: newAssignment,
            message: 'Body Assignment created successfully'
        });
    } catch (error) {
        console.error('Error creating body assignment:', error);
        res.status(500).json({
            status: 'error',
            body: null,
            message: 'An error occurred while creating the body assignment'
        });
    }
};

// Update body assignment
const updateBodyAssignment = async (req, res) => {
    try {
        const { title, description, published } = req.body;
        
        const assignment = await BodyAssignment.findById(req.params.id);
        
        if (!assignment) {
            return res.status(404).json({
                status: 'error',
                body: null,
                message: 'Body Assignment not found'
            });
        }
        
        if (title !== undefined) assignment.title = title;
        if (description !== undefined) assignment.description = description;
        if (published !== undefined) assignment.published = published;
        
        assignment.lastEditedBy = req.user ? req.user._id : null;
        
        await assignment.save();
        
        res.json({
            status: 'success',
            body: assignment,
            message: 'Body Assignment updated successfully'
        });
    } catch (error) {
        console.error('Error updating body assignment:', error);
        res.status(500).json({
            status: 'error',
            body: null,
            message: 'An error occurred while updating the body assignment'
        });
    }
};

// Delete body assignment
const deleteBodyAssignment = async (req, res) => {
    try {
        const assignment = await BodyAssignment.findById(req.params.id);
        
        if (!assignment) {
            return res.status(404).json({
                status: 'error',
                body: null,
                message: 'Body Assignment not found'
            });
        }
        
        await assignment.deleteOne();
        
        res.json({
            status: 'success',
            body: null,
            message: 'Body Assignment deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting body assignment:', error);
        res.status(500).json({
            status: 'error',
            body: null,
            message: 'An error occurred while deleting the body assignment'
        });
    }
};

// Duplicate body assignment
const duplicateBodyAssignment = async (req, res) => {
    try {
        const original = await BodyAssignment.findById(req.params.id);
        
        if (!original) {
            return res.status(404).json({
                status: 'error',
                body: null,
                message: 'Body Assignment not found'
            });
        }
        
        const duplicate = new BodyAssignment({
            title: `${original.title} (Copy)`,
            description: original.description,
            mainColors: original.mainColors,
            published: false,
            createdBy: req.user ? req.user._id : null,
            lastEditedBy: req.user ? req.user._id : null
        });
        
        await duplicate.save();
        
        res.status(201).json({
            status: 'success',
            body: duplicate,
            message: 'Body Assignment duplicated successfully'
        });
    } catch (error) {
        console.error('Error duplicating body assignment:', error);
        res.status(500).json({
            status: 'error',
            body: null,
            message: 'An error occurred while duplicating the body assignment'
        });
    }
};

// ==================== MAIN COLOR OPERATIONS ====================

// Add main color to assignment
const addMainColor = async (req, res) => {
    try {
        const { hex, feeling, voiceText, voiceMeta, audioFile, generatedTtsUrl } = req.body;
        
        if (!hex || !feeling) {
            return res.status(400).json({
                status: 'error',
                body: null,
                message: 'Hex color and feeling are required'
            });
        }
        
        const assignment = await BodyAssignment.findById(req.params.id);
        
        if (!assignment) {
            return res.status(404).json({
                status: 'error',
                body: null,
                message: 'Body Assignment not found'
            });
        }
        
        // Check for duplicate hex in main colors
        const hexLower = hex.toLowerCase();
        const isDuplicate = assignment.mainColors.some(
            color => color.hex.toLowerCase() === hexLower
        );
        
        if (isDuplicate) {
            return res.status(400).json({
                status: 'error',
                body: null,
                message: 'This color already exists in the assignment'
            });
        }
        
        const newMainColor = {
            hex,
            feeling,
            voiceText,
            voiceMeta,
            audioFile,
            generatedTtsUrl,
            hasAudio: !!(audioFile || generatedTtsUrl),
            subFeelings: []
        };
        
        assignment.mainColors.push(newMainColor);
        assignment.lastEditedBy = req.user ? req.user._id : null;
        
        await assignment.save();
        
        res.status(201).json({
            status: 'success',
            body: assignment,
            message: 'Main color added successfully'
        });
    } catch (error) {
        console.error('Error adding main color:', error);
        res.status(500).json({
            status: 'error',
            body: null,
            message: 'An error occurred while adding the main color'
        });
    }
};

// Update main color
const updateMainColor = async (req, res) => {
    try {
        const { assignmentId, colorId } = req.params;
        const { hex, feeling, voiceText, voiceMeta, audioFile, generatedTtsUrl } = req.body;
        
        const assignment = await BodyAssignment.findById(assignmentId);
        
        if (!assignment) {
            return res.status(404).json({
                status: 'error',
                body: null,
                message: 'Body Assignment not found'
            });
        }
        
        const mainColor = assignment.mainColors.id(colorId);
        
        if (!mainColor) {
            return res.status(404).json({
                status: 'error',
                body: null,
                message: 'Main color not found'
            });
        }
        
        // Check for duplicate hex if hex is being changed
        if (hex && hex.toLowerCase() !== mainColor.hex.toLowerCase()) {
            const hexLower = hex.toLowerCase();
            const isDuplicate = assignment.mainColors.some(
                color => color._id.toString() !== colorId && color.hex.toLowerCase() === hexLower
            );
            
            if (isDuplicate) {
                return res.status(400).json({
                    status: 'error',
                    body: null,
                    message: 'This color already exists in the assignment'
                });
            }
        }
        
        if (hex !== undefined) mainColor.hex = hex;
        if (feeling !== undefined) mainColor.feeling = feeling;
        if (voiceText !== undefined) mainColor.voiceText = voiceText;
        if (voiceMeta !== undefined) mainColor.voiceMeta = voiceMeta;
        if (audioFile !== undefined) mainColor.audioFile = audioFile;
        if (generatedTtsUrl !== undefined) mainColor.generatedTtsUrl = generatedTtsUrl;
        
        mainColor.hasAudio = !!(mainColor.audioFile || mainColor.generatedTtsUrl);
        assignment.lastEditedBy = req.user ? req.user._id : null;
        
        await assignment.save();
        
        res.json({
            status: 'success',
            body: assignment,
            message: 'Main color updated successfully'
        });
    } catch (error) {
        console.error('Error updating main color:', error);
        res.status(500).json({
            status: 'error',
            body: null,
            message: 'An error occurred while updating the main color'
        });
    }
};

// Delete main color
const deleteMainColor = async (req, res) => {
    try {
        const { assignmentId, colorId } = req.params;
        
        const assignment = await BodyAssignment.findById(assignmentId);
        
        if (!assignment) {
            return res.status(404).json({
                status: 'error',
                body: null,
                message: 'Body Assignment not found'
            });
        }
        
        const mainColor = assignment.mainColors.id(colorId);
        
        if (!mainColor) {
            return res.status(404).json({
                status: 'error',
                body: null,
                message: 'Main color not found'
            });
        }
        
        mainColor.deleteOne();
        assignment.lastEditedBy = req.user ? req.user._id : null;
        
        await assignment.save();
        
        res.json({
            status: 'success',
            body: assignment,
            message: 'Main color deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting main color:', error);
        res.status(500).json({
            status: 'error',
            body: null,
            message: 'An error occurred while deleting the main color'
        });
    }
};

// ==================== SUB-FEELING OPERATIONS ====================

// Add sub-feeling to main color
const addSubFeeling = async (req, res) => {
    try {
        const { assignmentId, colorId } = req.params;
        const { hex, subFeeling, voiceText, voiceMeta, audioFile, generatedTtsUrl } = req.body;
        
        if (!hex || !subFeeling) {
            return res.status(400).json({
                status: 'error',
                body: null,
                message: 'Hex color and sub-feeling are required'
            });
        }
        
        const assignment = await BodyAssignment.findById(assignmentId);
        
        if (!assignment) {
            return res.status(404).json({
                status: 'error',
                body: null,
                message: 'Body Assignment not found'
            });
        }
        
        const mainColor = assignment.mainColors.id(colorId);
        
        if (!mainColor) {
            return res.status(404).json({
                status: 'error',
                body: null,
                message: 'Main color not found'
            });
        }
        
        // Check limit of 10 sub-feelings
        if (mainColor.subFeelings.length >= 10) {
            return res.status(400).json({
                status: 'error',
                body: null,
                message: 'Cannot add more than 10 sub-feelings per main color'
            });
        }
        
        // Check for duplicate hex in sub-feelings
        const hexLower = hex.toLowerCase();
        const isDuplicate = mainColor.subFeelings.some(
            sf => sf.hex.toLowerCase() === hexLower
        );
        
        if (isDuplicate) {
            return res.status(400).json({
                status: 'error',
                body: null,
                message: 'This shade already exists for this main color'
            });
        }
        
        const newSubFeeling = {
            hex,
            subFeeling,
            voiceText,
            voiceMeta,
            audioFile,
            generatedTtsUrl,
            hasAudio: !!(audioFile || generatedTtsUrl),
            finalOptions: []
        };
        
        mainColor.subFeelings.push(newSubFeeling);
        assignment.lastEditedBy = req.user ? req.user._id : null;
        
        await assignment.save();
        
        res.status(201).json({
            status: 'success',
            body: assignment,
            message: 'Sub-feeling added successfully'
        });
    } catch (error) {
        console.error('Error adding sub-feeling:', error);
        res.status(500).json({
            status: 'error',
            body: null,
            message: 'An error occurred while adding the sub-feeling'
        });
    }
};

// Update sub-feeling
const updateSubFeeling = async (req, res) => {
    try {
        const { assignmentId, colorId, subFeelingId } = req.params;
        const { hex, subFeeling, voiceText, voiceMeta, audioFile, generatedTtsUrl } = req.body;
        
        const assignment = await BodyAssignment.findById(assignmentId);
        
        if (!assignment) {
            return res.status(404).json({
                status: 'error',
                body: null,
                message: 'Body Assignment not found'
            });
        }
        
        const mainColor = assignment.mainColors.id(colorId);
        
        if (!mainColor) {
            return res.status(404).json({
                status: 'error',
                body: null,
                message: 'Main color not found'
            });
        }
        
        const subFeelingDoc = mainColor.subFeelings.id(subFeelingId);
        
        if (!subFeelingDoc) {
            return res.status(404).json({
                status: 'error',
                body: null,
                message: 'Sub-feeling not found'
            });
        }
        
        // Check for duplicate hex if hex is being changed
        if (hex && hex.toLowerCase() !== subFeelingDoc.hex.toLowerCase()) {
            const hexLower = hex.toLowerCase();
            const isDuplicate = mainColor.subFeelings.some(
                sf => sf._id.toString() !== subFeelingId && sf.hex.toLowerCase() === hexLower
            );
            
            if (isDuplicate) {
                return res.status(400).json({
                    status: 'error',
                    body: null,
                    message: 'This shade already exists for this main color'
                });
            }
        }
        
        if (hex !== undefined) subFeelingDoc.hex = hex;
        if (subFeeling !== undefined) subFeelingDoc.subFeeling = subFeeling;
        if (voiceText !== undefined) subFeelingDoc.voiceText = voiceText;
        if (voiceMeta !== undefined) subFeelingDoc.voiceMeta = voiceMeta;
        if (audioFile !== undefined) subFeelingDoc.audioFile = audioFile;
        if (generatedTtsUrl !== undefined) subFeelingDoc.generatedTtsUrl = generatedTtsUrl;
        
        subFeelingDoc.hasAudio = !!(subFeelingDoc.audioFile || subFeelingDoc.generatedTtsUrl);
        assignment.lastEditedBy = req.user ? req.user._id : null;
        
        await assignment.save();
        
        res.json({
            status: 'success',
            body: assignment,
            message: 'Sub-feeling updated successfully'
        });
    } catch (error) {
        console.error('Error updating sub-feeling:', error);
        res.status(500).json({
            status: 'error',
            body: null,
            message: 'An error occurred while updating the sub-feeling'
        });
    }
};

// Delete sub-feeling
const deleteSubFeeling = async (req, res) => {
    try {
        const { assignmentId, colorId, subFeelingId } = req.params;
        
        const assignment = await BodyAssignment.findById(assignmentId);
        
        if (!assignment) {
            return res.status(404).json({
                status: 'error',
                body: null,
                message: 'Body Assignment not found'
            });
        }
        
        const mainColor = assignment.mainColors.id(colorId);
        
        if (!mainColor) {
            return res.status(404).json({
                status: 'error',
                body: null,
                message: 'Main color not found'
            });
        }
        
        const subFeelingDoc = mainColor.subFeelings.id(subFeelingId);
        
        if (!subFeelingDoc) {
            return res.status(404).json({
                status: 'error',
                body: null,
                message: 'Sub-feeling not found'
            });
        }
        
        subFeelingDoc.deleteOne();
        assignment.lastEditedBy = req.user ? req.user._id : null;
        
        await assignment.save();
        
        res.json({
            status: 'success',
            body: assignment,
            message: 'Sub-feeling deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting sub-feeling:', error);
        res.status(500).json({
            status: 'error',
            body: null,
            message: 'An error occurred while deleting the sub-feeling'
        });
    }
};

// ==================== FINAL OPTIONS OPERATIONS ====================

// Add or update final options (must be exactly 2)
const setFinalOptions = async (req, res) => {
    try {
        const { assignmentId, colorId, subFeelingId } = req.params;
        const { options } = req.body; // Array of 2 options
        
        if (!Array.isArray(options) || options.length !== 2) {
            return res.status(400).json({
                status: 'error',
                body: null,
                message: 'Exactly 2 final options are required'
            });
        }
        
        // Validate each option
        for (const option of options) {
            if (!option.hex || !option.feeling) {
                return res.status(400).json({
                    status: 'error',
                    body: null,
                    message: 'Each option must have hex color and feeling'
                });
            }
        }
        
        const assignment = await BodyAssignment.findById(assignmentId);
        
        if (!assignment) {
            return res.status(404).json({
                status: 'error',
                body: null,
                message: 'Body Assignment not found'
            });
        }
        
        const mainColor = assignment.mainColors.id(colorId);
        
        if (!mainColor) {
            return res.status(404).json({
                status: 'error',
                body: null,
                message: 'Main color not found'
            });
        }
        
        const subFeelingDoc = mainColor.subFeelings.id(subFeelingId);
        
        if (!subFeelingDoc) {
            return res.status(404).json({
                status: 'error',
                body: null,
                message: 'Sub-feeling not found'
            });
        }
        
        // Check for duplicate hex in final options
        const hexValues = options.map(o => o.hex.toLowerCase());
        if (hexValues[0] === hexValues[1]) {
            return res.status(400).json({
                status: 'error',
                body: null,
                message: 'Final options must have different colors'
            });
        }
        
        // Set final options
        subFeelingDoc.finalOptions = options.map(option => ({
            hex: option.hex,
            feeling: option.feeling,
            voiceText: option.voiceText,
            voiceMeta: option.voiceMeta,
            audioFile: option.audioFile,
            generatedTtsUrl: option.generatedTtsUrl,
            hasAudio: !!(option.audioFile || option.generatedTtsUrl)
        }));
        
        assignment.lastEditedBy = req.user ? req.user._id : null;
        
        await assignment.save();
        
        res.json({
            status: 'success',
            body: assignment,
            message: 'Final options set successfully'
        });
    } catch (error) {
        console.error('Error setting final options:', error);
        res.status(500).json({
            status: 'error',
            body: null,
            message: 'An error occurred while setting final options'
        });
    }
};

// Update single final option
const updateFinalOption = async (req, res) => {
    try {
        const { assignmentId, colorId, subFeelingId, optionId } = req.params;
        const { hex, feeling, voiceText, voiceMeta, audioFile, generatedTtsUrl } = req.body;
        
        const assignment = await BodyAssignment.findById(assignmentId);
        
        if (!assignment) {
            return res.status(404).json({
                status: 'error',
                body: null,
                message: 'Body Assignment not found'
            });
        }
        
        const mainColor = assignment.mainColors.id(colorId);
        
        if (!mainColor) {
            return res.status(404).json({
                status: 'error',
                body: null,
                message: 'Main color not found'
            });
        }
        
        const subFeelingDoc = mainColor.subFeelings.id(subFeelingId);
        
        if (!subFeelingDoc) {
            return res.status(404).json({
                status: 'error',
                body: null,
                message: 'Sub-feeling not found'
            });
        }
        
        const finalOption = subFeelingDoc.finalOptions.id(optionId);
        
        if (!finalOption) {
            return res.status(404).json({
                status: 'error',
                body: null,
                message: 'Final option not found'
            });
        }
        
        // Check for duplicate hex if hex is being changed
        if (hex && hex.toLowerCase() !== finalOption.hex.toLowerCase()) {
            const hexLower = hex.toLowerCase();
            const isDuplicate = subFeelingDoc.finalOptions.some(
                fo => fo._id.toString() !== optionId && fo.hex.toLowerCase() === hexLower
            );
            
            if (isDuplicate) {
                return res.status(400).json({
                    status: 'error',
                    body: null,
                    message: 'This color already exists in final options'
                });
            }
        }
        
        if (hex !== undefined) finalOption.hex = hex;
        if (feeling !== undefined) finalOption.feeling = feeling;
        if (voiceText !== undefined) finalOption.voiceText = voiceText;
        if (voiceMeta !== undefined) finalOption.voiceMeta = voiceMeta;
        if (audioFile !== undefined) finalOption.audioFile = audioFile;
        if (generatedTtsUrl !== undefined) finalOption.generatedTtsUrl = generatedTtsUrl;
        
        finalOption.hasAudio = !!(finalOption.audioFile || finalOption.generatedTtsUrl);
        assignment.lastEditedBy = req.user ? req.user._id : null;
        
        await assignment.save();
        
        res.json({
            status: 'success',
            body: assignment,
            message: 'Final option updated successfully'
        });
    } catch (error) {
        console.error('Error updating final option:', error);
        res.status(500).json({
            status: 'error',
            body: null,
            message: 'An error occurred while updating the final option'
        });
    }
};

// ==================== PREVIEW & PUBLISH ====================

// Get preview data for assignment
const getPreviewData = async (req, res) => {
    try {
        const assignment = await BodyAssignment.findById(req.params.id).lean();
        
        if (!assignment) {
            return res.status(404).json({
                status: 'error',
                body: null,
                message: 'Body Assignment not found'
            });
        }
        
        // Format data for preview
        const previewData = {
            title: assignment.title,
            description: assignment.description,
            mainColors: assignment.mainColors.map(mc => ({
                id: mc._id,
                hex: mc.hex,
                feeling: mc.feeling,
                voiceText: mc.voiceText,
                audioUrl: mc.audioFile || mc.generatedTtsUrl,
                hasAudio: mc.hasAudio,
                subFeelings: mc.subFeelings.map(sf => ({
                    id: sf._id,
                    hex: sf.hex,
                    subFeeling: sf.subFeeling,
                    voiceText: sf.voiceText,
                    audioUrl: sf.audioFile || sf.generatedTtsUrl,
                    hasAudio: sf.hasAudio,
                    finalOptions: sf.finalOptions.map(fo => ({
                        id: fo._id,
                        hex: fo.hex,
                        feeling: fo.feeling,
                        voiceText: fo.voiceText,
                        audioUrl: fo.audioFile || fo.generatedTtsUrl,
                        hasAudio: fo.hasAudio
                    }))
                }))
            }))
        };
        
        res.json({
            status: 'success',
            body: previewData,
            message: 'Preview data retrieved successfully'
        });
    } catch (error) {
        console.error('Error getting preview data:', error);
        res.status(500).json({
            status: 'error',
            body: null,
            message: 'An error occurred while retrieving preview data'
        });
    }
};

// Publish assignment
const publishAssignment = async (req, res) => {
    try {
        const assignment = await BodyAssignment.findById(req.params.id);
        
        if (!assignment) {
            return res.status(404).json({
                status: 'error',
                body: null,
                message: 'Body Assignment not found'
            });
        }
        
        // Validate assignment is complete
        if (assignment.mainColors.length === 0) {
            return res.status(400).json({
                status: 'error',
                body: null,
                message: 'Cannot publish assignment without main colors'
            });
        }
        
        assignment.published = true;
        assignment.publishedAt = new Date();
        assignment.lastEditedBy = req.user ? req.user._id : null;
        
        await assignment.save();
        
        res.json({
            status: 'success',
            body: assignment,
            message: 'Body Assignment published successfully'
        });
    } catch (error) {
        console.error('Error publishing assignment:', error);
        res.status(500).json({
            status: 'error',
            body: null,
            message: 'An error occurred while publishing the assignment'
        });
    }
};

// Unpublish assignment
const unpublishAssignment = async (req, res) => {
    try {
        const assignment = await BodyAssignment.findById(req.params.id);
        
        if (!assignment) {
            return res.status(404).json({
                status: 'error',
                body: null,
                message: 'Body Assignment not found'
            });
        }
        
        assignment.published = false;
        assignment.lastEditedBy = req.user ? req.user._id : null;
        
        await assignment.save();
        
        res.json({
            status: 'success',
            body: assignment,
            message: 'Body Assignment unpublished successfully'
        });
    } catch (error) {
        console.error('Error unpublishing assignment:', error);
        res.status(500).json({
            status: 'error',
            body: null,
            message: 'An error occurred while unpublishing the assignment'
        });
    }
};

module.exports = {
    // Assignment CRUD
    getAllBodyAssignments,
    getBodyAssignmentById,
    createBodyAssignment,
    updateBodyAssignment,
    deleteBodyAssignment,
    duplicateBodyAssignment,
    
    // Main Color operations
    addMainColor,
    updateMainColor,
    deleteMainColor,
    
    // Sub-Feeling operations
    addSubFeeling,
    updateSubFeeling,
    deleteSubFeeling,
    
    // Final Options operations
    setFinalOptions,
    updateFinalOption,
    
    // Preview & Publish
    getPreviewData,
    publishAssignment,
    unpublishAssignment
};







