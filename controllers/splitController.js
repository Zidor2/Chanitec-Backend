const Split = require('../models/splitModel');

// Get all splits
const getAllSplits = async (req, res) => {
    try {
        const splits = await Split.findAll();
        res.json(splits);
    } catch (error) {
        console.error('Error fetching splits:', error);
        res.status(500).json({ error: 'Error fetching splits' });
    }
};

// GET /api/splits/lookup?code=... — where this split code exists (client > site)
const getSplitLocationByCode = async (req, res) => {
    const code = typeof req.query.code === 'string' ? req.query.code.trim() : '';
    if (!code) {
        return res.status(400).json({ error: 'Query parameter "code" is required' });
    }
    try {
        const row = await Split.findLocationByCode(code);
        if (!row) {
            return res.json({ exists: false });
        }
        return res.json({
            exists: true,
            clientName: row.client_name,
            siteName: row.site_name,
            siteId: row.site_id,
            clientId: row.client_id
        });
    } catch (error) {
        console.error('Error looking up split code:', error);
        res.status(500).json({ error: 'Error looking up split code' });
    }
};

// Get split by id
const getSplitById = async (req, res) => {
    try {
        const split = await Split.findById(req.params.id);
        if (!split) {
            return res.status(404).json({ error: 'Split not found' });
        }
        res.json(split);
    } catch (error) {
        console.error('Error fetching split:', error);
        res.status(500).json({ error: 'Error fetching split' });
    }
};

// Create new split
const createSplit = async (req, res) => {
    const { code, name, description, puissance, site_id, freon } = req.body;
    if (!code || !name || !site_id) {
        return res.status(400).json({ error: 'Code, name, and site_id are required' });
    }
    // Validate freon if provided
    if (freon && !['R22', 'R410a'].includes(freon)) {
        return res.status(400).json({ error: 'Invalid freon type. Must be R22 or R410a' });
    }
    try {
        const split = await Split.create({ code, name, description, puissance, site_id, freon: freon || null });
        res.status(201).json(split);
    } catch (error) {
        console.error('Error creating split:', error);
        res.status(500).json({ error: 'Error creating split' });
    }
};

// Update split
const updateSplit = async (req, res) => {
    const { code, name, description, puissance, site_id, freon } = req.body;
    // Validate freon if provided
    if (freon && !['R22', 'R410a'].includes(freon)) {
        return res.status(400).json({ error: 'Invalid freon type. Must be R22 or R410a' });
    }
    try {
        // Check if split exists
        const existingSplit = await Split.findById(req.params.id);
        if (!existingSplit) {
            return res.status(404).json({ error: 'Split not found' });
        }

        // Check if any attributes have changed
        const needsUpdate = await Split.needsUpdate(req.params.id, { code, name, description, puissance, site_id, freon: freon || null });

        if (!needsUpdate) {
            // No changes needed, return current split
            return res.json(existingSplit);
        }

        // Perform the update
        const split = await Split.update(req.params.id, { code, name, description, puissance, site_id, freon: freon || null });
        res.json(split);
    } catch (error) {
        if (error.message === 'Split code already exists') {
            return res.status(409).json({ error: 'Split code already exists' });
        }
        console.error('Error updating split:', error);
        res.status(500).json({ error: 'Error updating split' });
    }
};

// Delete split
const deleteSplit = async (req, res) => {
    try {
        await Split.delete(req.params.id);
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting split:', error);
        res.status(500).json({ error: 'Error deleting split' });
    }
};

// Get site for split
const findBySiteId = async (req, res) => {
    try {
        const splits = await Split.findBySiteId(req.params.site_id);
        if (!splits) {
            return res.status(404).json({ error: 'splits not found for this site' });
        }
        res.json(splits);
    } catch (error) {
        console.error('Error fetching splits for site:', error);
        res.status(500).json({ error: 'Error fetching splits for site' });
    }
};

module.exports = {
    getAllSplits,
    getSplitLocationByCode,
    getSplitById,
    createSplit,
    updateSplit,
    deleteSplit,
    findBySiteId
};