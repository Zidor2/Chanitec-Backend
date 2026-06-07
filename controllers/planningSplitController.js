const { safeQuery } = require('../utils/databaseUtils');
const PlanningSplit = require('../models/planningSplitModel');

// Get all planning_split records
const getAllPlanningSplits = async (req, res) => {
    try {
        const rows = await safeQuery(
            `SELECT ps.*, s.Code AS split_code, s.name AS split_name, s.description AS split_marque, s.puissance, s.freon
             FROM planning_split ps
             LEFT JOIN splits s ON ps.split_id = s.id
             ORDER BY ps.created_at DESC`
        );
        res.json(rows);
    } catch (error) {
        console.error('Error fetching planning splits:', {
            message: error.message,
            code: error.code,
            stack: error.stack
        });
        res.status(500).json({ error: 'Error fetching planning splits' });
    }
};

// Get planning_split record by ID
const getPlanningSplitById = async (req, res) => {
    try {
        const rows = await safeQuery(
            `SELECT ps.*, s.Code AS split_code, s.name AS split_name, s.description AS split_marque, s.puissance, s.freon
             FROM planning_split ps
             LEFT JOIN splits s ON ps.split_id = s.id
             WHERE ps.id = ?`,
            [req.params.id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Planning split not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching planning split:', error);
        res.status(500).json({ error: 'Error fetching planning split' });
    }
};

// Get planning_splits by planning site ID
const getPlanningSplitsByPlanningSiteId = async (req, res) => {
    try {
        const { planningSiteId } = req.params;
        const rows = await safeQuery(
            `SELECT ps.*, s.Code AS split_code, s.name AS split_name, s.description AS split_marque, s.puissance, s.freon
             FROM planning_split ps
             LEFT JOIN splits s ON ps.split_id = s.id
             WHERE ps.planning_site_id = ?
             ORDER BY ps.created_at DESC`,
            [planningSiteId]
        );
        res.json(rows);
    } catch (error) {
        console.error('Error fetching planning splits for planning site:', error);
        res.status(500).json({ error: 'Error fetching planning splits for planning site' });
    }
};

// Get planning_splits by status
const getPlanningSplitsByStatus = async (req, res) => {
    try {
        const { status } = req.params;
        const rows = await safeQuery(
            'SELECT * FROM planning_split WHERE status = ? ORDER BY created_at DESC',
            [status]
        );
        res.json(rows);
    } catch (error) {
        console.error('Error fetching planning splits by status:', error);
        res.status(500).json({ error: 'Error fetching planning splits by status' });
    }
};

// Create new planning_split record
const createPlanningSplit = async (req, res) => {
    const { planning_site_id, status } = req.body;

    // Validate required fields
    if (!planning_site_id) {
        return res.status(400).json({ error: 'planning_site_id is required' });
    }
    if (!req.body.split_id) {
        return res.status(400).json({ error: 'split_id is required' });
    }

    // Validate status if provided
    const validStatuses = ['pending', 'active', 'completed', 'cancelled'];
    if (status && !validStatuses.includes(status)) {
        return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    try {
        const newPlanningSplit = await PlanningSplit.create({
            planning_site_id,
            split_id: req.body.split_id,
            status: status || 'pending'
        });

        if (!newPlanningSplit) {
            throw new Error('Failed to retrieve newly created planning split record');
        }

        res.status(201).json(newPlanningSplit);
    } catch (error) {
        console.error('Error creating planning split:', {
            message: error.message,
            code: error.code,
            stack: error.stack
        });
        res.status(500).json({ error: 'Error creating planning split' });
    }
};

// Create multiple planning_split records in a batch
const createPlanningSplitsBatch = async (req, res) => {
    const { planning_site_id, splits } = req.body;

    if (!planning_site_id) {
        return res.status(400).json({ error: 'planning_site_id is required' });
    }

    if (!Array.isArray(splits) || splits.length === 0) {
        return res.status(400).json({ error: 'splits must be a non-empty array' });
    }

    // Validate splits entries
    const validStatuses = ['pending', 'active', 'completed', 'cancelled'];
    for (let i = 0; i < splits.length; i++) {
        const s = splits[i];
        if (!s || !s.split_id) {
            return res.status(400).json({ error: `Each split must include split_id (error at index ${i})` });
        }
        if (s.status && !validStatuses.includes(s.status)) {
            return res.status(400).json({ error: `Invalid status for split at index ${i}. Must be one of: ${validStatuses.join(', ')}` });
        }
    }

    try {
        // Prepare rows for batch insert
        const rows = splits.map(s => [
            planning_site_id,
            s.split_id || null,
            s.status || 'pending'
        ]);

        // Use transaction to ensure atomicity
        const { withTransaction } = require('../utils/databaseUtils');

        await withTransaction(async (connection) => {
            const placeholders = rows.map(() => '(UUID(), ?, ?, ?)').join(', ');
            const flatValues = rows.flat();
            const query = `INSERT INTO planning_split (id, planning_site_id, split_id, status) VALUES ${placeholders}`;
            await connection.execute(query, flatValues);
            return true;
        });

        // Return the newly created rows for this planning site
        const created = await safeQuery('SELECT * FROM planning_split WHERE planning_site_id = ? ORDER BY created_at DESC', [planning_site_id]);
        res.status(201).json(created);
    } catch (error) {
        console.error('Error creating planning splits batch:', {
            message: error.message,
            code: error.code,
            stack: error.stack
        });
        res.status(500).json({ error: 'Error creating planning splits batch' });
    }
};

// Update planning_split record
const updatePlanningSplit = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    // Validate that at least one field is provided
    if (status === undefined) {
        return res.status(400).json({
            error: 'At least one field must be provided for update'
        });
    }

    try {
        // Check if planning_split record exists
        const existingPlanningSplit = await PlanningSplit.findById(id);
        if (!existingPlanningSplit) {
            return res.status(404).json({ error: 'Planning split not found' });
        }

        const updateData = {};
        if (status !== undefined) updateData.status = status;

        const updatedPlanningSplit = await PlanningSplit.update(id, updateData);

        res.json(updatedPlanningSplit);
    } catch (error) {
        console.error('Error updating planning split:', {
            message: error.message,
            code: error.code,
            stack: error.stack
        });
        res.status(500).json({ error: 'Error updating planning split' });
    }
};

// Delete planning_split record
const deletePlanningSplit = async (req, res) => {
    const { id } = req.params;

    try {
        // Check if planning_split record exists
        const existingPlanningSplit = await PlanningSplit.findById(id);
        if (!existingPlanningSplit) {
            return res.status(404).json({ error: 'Planning split not found' });
        }

        await PlanningSplit.delete(id);
        res.json({ message: 'Planning split deleted successfully', id });
    } catch (error) {
        console.error('Error deleting planning split:', {
            message: error.message,
            code: error.code,
            stack: error.stack
        });
        res.status(500).json({ error: 'Error deleting planning split' });
    }
};

// Delete planning_splits by planning site ID
const deletePlanningSplitsByPlanningSiteId = async (req, res) => {
    const { planningSiteId } = req.params;

    try {
        const result = await PlanningSplit.deleteByPlanningSiteId(planningSiteId);
        res.json({ message: 'Planning splits deleted successfully', planningSiteId });
    } catch (error) {
        console.error('Error deleting planning splits by planning site ID:', {
            message: error.message,
            code: error.code,
            stack: error.stack
        });
        res.status(500).json({ error: 'Error deleting planning splits' });
    }
};

// Get statistics
const getPlanningSplitStats = async (req, res) => {
    try {
        const total = await PlanningSplit.count();
        const byStatus = {};

        // Get count for each status
        const statusList = ['pending', 'active', 'completed', 'cancelled'];
        for (const status of statusList) {
            const count = await PlanningSplit.countByStatus(status);
            if (count > 0) {
                byStatus[status] = count;
            }
        }

        res.json({
            total,
            byStatus
        });
    } catch (error) {
        console.error('Error fetching planning split stats:', error);
        res.status(500).json({ error: 'Error fetching planning split stats' });
    }
};

module.exports = {
    getAllPlanningSplits,
    getPlanningSplitById,
    getPlanningSplitsByPlanningSiteId,
    getPlanningSplitsByStatus,
    createPlanningSplit,
    createPlanningSplitsBatch,
    updatePlanningSplit,
    deletePlanningSplit,
    deletePlanningSplitsByPlanningSiteId,
    getPlanningSplitStats
};
