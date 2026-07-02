const Description = require('../models/descriptionModel');

// Get all descriptions, optionally filtered by section
const getAllDescriptions = async (req, res) => {
    try {
        const rows = await Description.findAll(req.query.section);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching descriptions:', {
            message: error.message,
            code: error.code,
            stack: error.stack
        });
        res.status(500).json({ error: 'Error fetching descriptions' });
    }
};

// Create new description
const createDescription = async (req, res) => {
    const { content, section } = req.body;

    if (!content || typeof content !== 'string' || content.trim() === '') {
        return res.status(400).json({ error: 'Content is required' });
    }

    try {
        const description = await Description.create({ content: content.trim(), section });
        res.status(201).json(description);
    } catch (error) {
        console.error('Error creating description:', error);
        res.status(500).json({
            error: 'Error creating description',
            details: error.message
        });
    }
};

// Update description
const updateDescription = async (req, res) => {
    const { content, section } = req.body;

    if (content !== undefined && (typeof content !== 'string' || content.trim() === '')) {
        return res.status(400).json({ error: 'Content must be a non-empty string when provided' });
    }

    try {
        const description = await Description.update(req.params.id, {
            content: content ? content.trim() : undefined,
            section
        });

        if (!description) {
            return res.status(404).json({ error: 'Description not found' });
        }

        res.json(description);
    } catch (error) {
        console.error('Error updating description:', error);
        res.status(500).json({
            error: 'Error updating description',
            details: error.message
        });
    }
};

// Delete description
const deleteDescription = async (req, res) => {
    try {
        await Description.delete(req.params.id);
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting description:', error);
        res.status(500).json({
            error: 'Error deleting description',
            details: error.message
        });
    }
};

module.exports = {
    getAllDescriptions,
    createDescription,
    updateDescription,
    deleteDescription
};
