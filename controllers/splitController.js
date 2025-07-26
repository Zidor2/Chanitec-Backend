const pool = require('../database/pool');
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

// Get split by code
const getSplitById = async (req, res) => {
    try {
        const split = await Split.findById(req.params.code);
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
    const { code, name, description, puissance, site_id } = req.body;
    if (!code || !name || !site_id) {
        return res.status(400).json({ error: 'Code, name, and site_id are required' });
    }
    try {
        const split = await Split.create({ code, name, description, puissance, site_id });
        res.status(201).json(split);
    } catch (error) {
        console.error('Error creating split:', error);
        res.status(500).json({ error: 'Error creating split' });
    }
};

// Update split
const updateSplit = async (req, res) => {
    const { name, description, puissance, site_id } = req.body;
    try {
        const split = await Split.update(req.params.code, { name, description, puissance, site_id });
        if (!split) {
            return res.status(404).json({ error: 'Split not found' });
        }
        res.json(split);
    } catch (error) {
        console.error('Error updating split:', error);
        res.status(500).json({ error: 'Error updating split' });
    }
};

// Delete split
const deleteSplit = async (req, res) => {
    try {
        await Split.delete(req.params.code);
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting split:', error);
        res.status(500).json({ error: 'Error deleting split' });
    }
};

// Get site for split
const getSiteForSplit = async (req, res) => {
    try {
        const site = await Split.getSite(req.params.code);
        if (!site) {
            return res.status(404).json({ error: 'Site not found for this split' });
        }
        res.json(site);
    } catch (error) {
        console.error('Error fetching site for split:', error);
        res.status(500).json({ error: 'Error fetching site for split' });
    }
};

module.exports = {
    getAllSplits,
    getSplitById,
    createSplit,
    updateSplit,
    deleteSplit,
    getSiteForSplit
};