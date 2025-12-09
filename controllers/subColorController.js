const SubColor = require('../models/SubColor');
const Color = require('../models/Color');

// Controller to create a new sub-color
const createSubColor = async (req, res) => {
    const { colorId, name, hexCode, description, narration } = req.body;

    // Validate input
    if (!colorId || !name || !description || !narration) {
        return res.status(400).json({
            status: 'error',
            body: null,
            message: 'Color ID, name, description, and narration are required'
        });
    }

    try {
        // Check if the parent color exists
        const parentColor = await Color.findById(colorId);
        if (!parentColor) {
            return res.status(404).json({
                status: 'error',
                body: null,
                message: 'Parent color not found'
            });
        }

        // Create and save the new sub-color
        const newSubColor = new SubColor({
            colorId,
            name,
            hexCode: hexCode || '',
            description,
            narration
        });

        await newSubColor.save();

        res.status(201).json({
            status: 'success',
            body: newSubColor,
            message: 'Sub-color created successfully'
        });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            body: null,
            message: err.message
        });
    }
};

// Controller to get all sub-colors (optionally filtered by colorId)
const getAllSubColors = async (req, res) => {
    try {
        const { colorId } = req.query;
        const filter = colorId ? { colorId } : {};
        
        const subColors = await SubColor.find(filter).populate('colorId', 'mood hexColor');
        
        res.status(200).json({
            status: 'success',
            body: subColors,
            message: 'Sub-colors retrieved successfully'
        });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            body: null,
            message: err.message
        });
    }
};

// Controller to get a specific sub-color by ID
const getSubColorById = async (req, res) => {
    const { id } = req.params;

    try {
        const subColor = await SubColor.findById(id).populate('colorId', 'mood hexColor');

        if (!subColor) {
            return res.status(404).json({
                status: 'error',
                body: null,
                message: 'Sub-color not found'
            });
        }

        res.status(200).json({
            status: 'success',
            body: subColor,
            message: 'Sub-color retrieved successfully'
        });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            body: null,
            message: err.message
        });
    }
};

// Controller to update a sub-color by ID
const updateSubColor = async (req, res) => {
    const { id } = req.params;
    const { colorId, name, hexCode, description, narration } = req.body;

    try {
        // If colorId is being updated, verify the new parent color exists
        if (colorId) {
            const parentColor = await Color.findById(colorId);
            if (!parentColor) {
                return res.status(404).json({
                    status: 'error',
                    body: null,
                    message: 'Parent color not found'
                });
            }
        }

        const updateData = {};
        if (colorId !== undefined) updateData.colorId = colorId;
        if (name !== undefined) updateData.name = name;
        if (hexCode !== undefined) updateData.hexCode = hexCode;
        if (description !== undefined) updateData.description = description;
        if (narration !== undefined) updateData.narration = narration;

        const updatedSubColor = await SubColor.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).populate('colorId', 'mood hexColor');

        if (!updatedSubColor) {
            return res.status(404).json({
                status: 'error',
                body: null,
                message: 'Sub-color not found'
            });
        }

        res.status(200).json({
            status: 'success',
            body: updatedSubColor,
            message: 'Sub-color updated successfully'
        });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            body: null,
            message: err.message
        });
    }
};

// Controller to delete a sub-color by ID
const deleteSubColor = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedSubColor = await SubColor.findByIdAndDelete(id);

        if (!deletedSubColor) {
            return res.status(404).json({
                status: 'error',
                body: null,
                message: 'Sub-color not found'
            });
        }

        res.status(200).json({
            status: 'success',
            body: deletedSubColor,
            message: 'Sub-color deleted successfully'
        });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            body: null,
            message: err.message
        });
    }
};

module.exports = {
    createSubColor,
    getAllSubColors,
    getSubColorById,
    updateSubColor,
    deleteSubColor
};







