const SubSubColor = require('../models/SubSubColor');
const SubColor = require('../models/SubColor');

// Controller to create a new sub-sub-color
const createSubSubColor = async (req, res) => {
    const { subColorId, name, description, narration } = req.body;

    // Validate input
    if (!subColorId || !name || !description || !narration) {
        return res.status(400).json({
            status: 'error',
            body: null,
            message: 'Sub-color ID, name, description, and narration are required'
        });
    }

    try {
        // Check if the parent sub-color exists
        const parentSubColor = await SubColor.findById(subColorId);
        if (!parentSubColor) {
            return res.status(404).json({
                status: 'error',
                body: null,
                message: 'Parent sub-color not found'
            });
        }

        // Create and save the new sub-sub-color
        const newSubSubColor = new SubSubColor({
            subColorId,
            name,
            description,
            narration
        });

        await newSubSubColor.save();

        res.status(201).json({
            status: 'success',
            body: newSubSubColor,
            message: 'Sub-sub-color created successfully'
        });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            body: null,
            message: err.message
        });
    }
};

// Controller to get all sub-sub-colors (optionally filtered by subColorId)
const getAllSubSubColors = async (req, res) => {
    try {
        const { subColorId } = req.query;
        const filter = subColorId ? { subColorId } : {};
        
        const subSubColors = await SubSubColor.find(filter).populate({
            path: 'subColorId',
            select: 'name hexCode colorId',
            populate: {
                path: 'colorId',
                select: 'mood hexColor'
            }
        });
        
        res.status(200).json({
            status: 'success',
            body: subSubColors,
            message: 'Sub-sub-colors retrieved successfully'
        });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            body: null,
            message: err.message
        });
    }
};

// Controller to get a specific sub-sub-color by ID
const getSubSubColorById = async (req, res) => {
    const { id } = req.params;

    try {
        const subSubColor = await SubSubColor.findById(id).populate({
            path: 'subColorId',
            select: 'name hexCode colorId',
            populate: {
                path: 'colorId',
                select: 'mood hexColor'
            }
        });

        if (!subSubColor) {
            return res.status(404).json({
                status: 'error',
                body: null,
                message: 'Sub-sub-color not found'
            });
        }

        res.status(200).json({
            status: 'success',
            body: subSubColor,
            message: 'Sub-sub-color retrieved successfully'
        });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            body: null,
            message: err.message
        });
    }
};

// Controller to update a sub-sub-color by ID
const updateSubSubColor = async (req, res) => {
    const { id } = req.params;
    const { subColorId, name, description, narration } = req.body;

    try {
        // If subColorId is being updated, verify the new parent sub-color exists
        if (subColorId) {
            const parentSubColor = await SubColor.findById(subColorId);
            if (!parentSubColor) {
                return res.status(404).json({
                    status: 'error',
                    body: null,
                    message: 'Parent sub-color not found'
                });
            }
        }

        const updateData = {};
        if (subColorId !== undefined) updateData.subColorId = subColorId;
        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (narration !== undefined) updateData.narration = narration;

        const updatedSubSubColor = await SubSubColor.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).populate({
            path: 'subColorId',
            select: 'name hexCode colorId',
            populate: {
                path: 'colorId',
                select: 'mood hexColor'
            }
        });

        if (!updatedSubSubColor) {
            return res.status(404).json({
                status: 'error',
                body: null,
                message: 'Sub-sub-color not found'
            });
        }

        res.status(200).json({
            status: 'success',
            body: updatedSubSubColor,
            message: 'Sub-sub-color updated successfully'
        });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            body: null,
            message: err.message
        });
    }
};

// Controller to delete a sub-sub-color by ID
const deleteSubSubColor = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedSubSubColor = await SubSubColor.findByIdAndDelete(id);

        if (!deletedSubSubColor) {
            return res.status(404).json({
                status: 'error',
                body: null,
                message: 'Sub-sub-color not found'
            });
        }

        res.status(200).json({
            status: 'success',
            body: deletedSubSubColor,
            message: 'Sub-sub-color deleted successfully'
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
    createSubSubColor,
    getAllSubSubColors,
    getSubSubColorById,
    updateSubSubColor,
    deleteSubSubColor
};







