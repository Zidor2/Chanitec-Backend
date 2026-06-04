const { safeQuery } = require('../utils/databaseUtils');
const Planning = require('../models/planningModel');

// Get all planning records
const getAllPlanning = async (req, res) => {
    try {
        const rows = await safeQuery('SELECT * FROM planning ORDER BY created_at DESC');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching planning records:', {
            message: error.message,
            code: error.code,
            stack: error.stack
        });
        res.status(500).json({ error: 'Error fetching planning records' });
    }
};

// Get planning record by ID
const getPlanningById = async (req, res) => {
    try {
        const rows = await safeQuery('SELECT * FROM planning WHERE id = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Planning record not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching planning record:', error);
        res.status(500).json({ error: 'Error fetching planning record' });
    }
};

// Get planning records by client ID
const getPlanningByClientId = async (req, res) => {
    try {
        const { clientId } = req.params;
        const rows = await safeQuery(
            'SELECT * FROM planning WHERE client_id = ? ORDER BY created_at DESC',
            [clientId]
        );
        res.json(rows);
    } catch (error) {
        console.error('Error fetching planning records for client:', error);
        res.status(500).json({ error: 'Error fetching planning records for client' });
    }
};

// Create new planning record
const createPlanning = async (req, res) => {
    const { client_id, name, description, status } = req.body;

    // Validate required fields
    if (!client_id) {
        return res.status(400).json({ error: 'client_id is required' });
    }
    if (!name) {
        return res.status(400).json({ error: 'name is required' });
    }

    // Validate status if provided
    const validStatuses = ['planned', 'active', 'finished'];
    if (status && !validStatuses.includes(status)) {
        return res.status(400).json({
            error: 'Invalid status. Must be one of: planned, active, finished'
        });
    }

    try {
        const newPlanning = await Planning.create({
            client_id,
            name,
            description,
            status: status || 'planned'
        });

        if (!newPlanning) {
            throw new Error('Failed to retrieve newly created planning record');
        }

        res.status(201).json(newPlanning);
    } catch (error) {
        console.error('Error creating planning record:', {
            message: error.message,
            code: error.code,
            stack: error.stack
        });
        res.status(500).json({ error: 'Error creating planning record' });
    }
};

// Update planning record
const updatePlanning = async (req, res) => {
    const { id } = req.params;
    const { name, description, status } = req.body;

    // Validate that at least one field is provided
    if (!name && !description && !status) {
        return res.status(400).json({
            error: 'At least one field (name, description, or status) must be provided'
        });
    }

    // Validate status if provided
    const validStatuses = ['planned', 'active', 'finished'];
    if (status && !validStatuses.includes(status)) {
        return res.status(400).json({
            error: 'Invalid status. Must be one of: planned, active, finished'
        });
    }

    try {
        // Check if planning record exists
        const existingPlanning = await Planning.findById(id);
        if (!existingPlanning) {
            return res.status(404).json({ error: 'Planning record not found' });
        }

        // Update with provided fields, keeping existing values for undefined fields
        const updatedPlanning = await Planning.update(id, {
            name: name !== undefined ? name : existingPlanning.name,
            description: description !== undefined ? description : existingPlanning.description,
            status: status !== undefined ? status : existingPlanning.status
        });

        res.json(updatedPlanning);
    } catch (error) {
        console.error('Error updating planning record:', {
            message: error.message,
            code: error.code,
            stack: error.stack
        });
        res.status(500).json({ error: 'Error updating planning record' });
    }
};

// Delete planning record
const deletePlanning = async (req, res) => {
    const { id } = req.params;

    try {
        // Check if planning record exists
        const existingPlanning = await Planning.findById(id);
        if (!existingPlanning) {
            return res.status(404).json({ error: 'Planning record not found' });
        }

        await Planning.delete(id);
        res.json({ message: 'Planning record deleted successfully', id });
    } catch (error) {
        console.error('Error deleting planning record:', {
            message: error.message,
            code: error.code,
            stack: error.stack
        });
        res.status(500).json({ error: 'Error deleting planning record' });
    }
};

// Get planning records by status
const getPlanningByStatus = async (req, res) => {
    try {
        const { status } = req.params;

        const validStatuses = ['planned', 'active', 'finished'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                error: 'Invalid status. Must be one of: planned, active, finished'
            });
        }

        const rows = await safeQuery(
            'SELECT * FROM planning WHERE status = ? ORDER BY created_at DESC',
            [status]
        );
        res.json(rows);
    } catch (error) {
        console.error('Error fetching planning records by status:', error);
        res.status(500).json({ error: 'Error fetching planning records by status' });
    }
};

module.exports = {
    getAllPlanning,
    getPlanningById,
    getPlanningByClientId,
    createPlanning,
    updatePlanning,
    deletePlanning,
    getPlanningByStatus
};
