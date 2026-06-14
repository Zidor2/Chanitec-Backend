const { safeQuery } = require('../utils/databaseUtils');
const PlanningSite = require('../models/planningSiteModel');

// Get all planning_sites records
const getAllPlanningSites = async (req, res) => {
    try {
        const rows = await safeQuery('SELECT * FROM planning_sites ORDER BY created_at DESC');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching planning sites:', {
            message: error.message,
            code: error.code,
            stack: error.stack
        });
        res.status(500).json({ error: 'Error fetching planning sites' });
    }
};

// Get planning_site record by ID
const getPlanningSiteById = async (req, res) => {
    try {
        const rows = await safeQuery('SELECT * FROM planning_sites WHERE id = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Planning site not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching planning site:', error);
        res.status(500).json({ error: 'Error fetching planning site' });
    }
};

// Get planning_sites by planning ID
const getPlanningSitesByPlanningId = async (req, res) => {
    try {
        const { planningId } = req.params;
        const rows = await safeQuery(
            'SELECT * FROM planning_sites WHERE planning_id = ? ORDER BY created_at DESC',
            [planningId]
        );
        res.json(rows);
    } catch (error) {
        console.error('Error fetching planning sites for planning:', error);
        res.status(500).json({ error: 'Error fetching planning sites for planning' });
    }
};

// Get planning_sites by site ID
const getPlanningSitesBySiteId = async (req, res) => {
    try {
        const { siteId } = req.params;
        const rows = await safeQuery(
            'SELECT * FROM planning_sites WHERE site_id = ? ORDER BY created_at DESC',
            [siteId]
        );
        res.json(rows);
    } catch (error) {
        console.error('Error fetching planning sites for site:', error);
        res.status(500).json({ error: 'Error fetching planning sites for site' });
    }
};

// Create new planning_site record
const createPlanningSite = async (req, res) => {
    const { planning_id, site_id, planned_date, effective_date, status, is_delayed, description } = req.body;

    // Validate required fields
    if (!planning_id) {
        return res.status(400).json({ error: 'planning_id is required' });
    }
    if (!site_id) {
        return res.status(400).json({ error: 'site_id is required' });
    }

    // Validate status if provided
    const validStatuses = ['planned', 'active', 'finished'];
    if (status && !validStatuses.includes(status)) {
        return res.status(400).json({
            error: 'Invalid status. Must be one of: planned, active, finished'
        });
    }

    try {
        const newPlanningSite = await PlanningSite.create({
            planning_id,
            site_id,
            planned_date,
            effective_date,
            status: status || 'planned',
            is_delayed: is_delayed || 0,
            description
        });

        if (!newPlanningSite) {
            throw new Error('Failed to retrieve newly created planning site record');
        }

        res.status(201).json(newPlanningSite);
    } catch (error) {
        console.error('Error creating planning site:', {
            message: error.message,
            code: error.code,
            stack: error.stack
        });
        res.status(500).json({ error: 'Error creating planning site' });
    }
};

// Update planning_site record
const updatePlanningSite = async (req, res) => {
    const { id } = req.params;
    const { planned_date, effective_date, status, is_delayed, description } = req.body;

    // Validate that at least one field is provided
    if (planned_date === undefined && effective_date === undefined && status === undefined && is_delayed === undefined && description === undefined) {
        return res.status(400).json({
            error: 'At least one field must be provided for update'
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
        // Check if planning_site record exists
        const existingPlanningSite = await PlanningSite.findById(id);
        if (!existingPlanningSite) {
            return res.status(404).json({ error: 'Planning site not found' });
        }

        // Normalize inputs: convert empty date strings to null to avoid SQL errors,
        // and coerce is_delayed to integer when provided.
        const updateData = {};
        if (planned_date !== undefined) {
            updateData.planned_date = planned_date === '' ? null : planned_date;
        }
        if (effective_date !== undefined) {
            updateData.effective_date = effective_date === '' ? null : effective_date;
        }
        if (status !== undefined) updateData.status = status;
        if (is_delayed !== undefined) updateData.is_delayed = Number(is_delayed) ? 1 : 0;
        if (description !== undefined) updateData.description = description === '' ? null : description;

        console.log('Updating planning_site', { id, updateData });

        const updatedPlanningSite = await PlanningSite.update(id, updateData);

        res.json(updatedPlanningSite);
    } catch (error) {
        console.error('Error updating planning site:', {
            message: error.message,
            code: error.code,
            stack: error.stack
        });
        // Return error details for easier debugging in dev (avoid exposing stack in production)
        res.status(500).json({ error: 'Error updating planning site', details: error.message });
    }
};

// Delete planning_site record
const deletePlanningSite = async (req, res) => {
    const { id } = req.params;

    try {
        // Check if planning_site record exists
        const existingPlanningSite = await PlanningSite.findById(id);
        if (!existingPlanningSite) {
            return res.status(404).json({ error: 'Planning site not found' });
        }

        await PlanningSite.delete(id);
        res.json({ message: 'Planning site deleted successfully', id });
    } catch (error) {
        console.error('Error deleting planning site:', {
            message: error.message,
            code: error.code,
            stack: error.stack
        });
        res.status(500).json({ error: 'Error deleting planning site' });
    }
};

// Get planning_sites by status
const getPlanningSitesByStatus = async (req, res) => {
    try {
        const { status } = req.params;

        const validStatuses = ['planned', 'active', 'finished'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                error: 'Invalid status. Must be one of: planned, active, finished'
            });
        }

        const rows = await safeQuery(
            'SELECT * FROM planning_sites WHERE status = ? ORDER BY created_at DESC',
            [status]
        );
        res.json(rows);
    } catch (error) {
        console.error('Error fetching planning sites by status:', error);
        res.status(500).json({ error: 'Error fetching planning sites by status' });
    }
};

// Delete planning_sites by planning ID (cascade delete)
const deletePlanningSitesByPlanningId = async (req, res) => {
    const { planningId } = req.params;

    try {
        const result = await PlanningSite.deleteByPlanningId(planningId);
        res.json({ message: 'Planning sites deleted successfully', planningId });
    } catch (error) {
        console.error('Error deleting planning sites by planning ID:', {
            message: error.message,
            code: error.code,
            stack: error.stack
        });
        res.status(500).json({ error: 'Error deleting planning sites' });
    }
};

// Create multiple planning_site records in a single batch (atomic)
const createPlanningSitesBatch = async (req, res) => {
    const { planning_id, sites } = req.body;

    if (!planning_id) {
        return res.status(400).json({ error: 'planning_id is required' });
    }

    if (!Array.isArray(sites) || sites.length === 0) {
        return res.status(400).json({ error: 'sites must be a non-empty array' });
    }

    // Validate each site entry
    const validStatuses = ['planned', 'active', 'finished'];
    for (let i = 0; i < sites.length; i++) {
        const s = sites[i];
        if (!s || !s.site_id) {
            return res.status(400).json({ error: `Each site must include site_id (error at index ${i})` });
        }
        if (s.status && !validStatuses.includes(s.status)) {
            return res.status(400).json({ error: `Invalid status for site at index ${i}. Must be one of: ${validStatuses.join(', ')}` });
        }
    }

    try {
        // Prepare rows for batch insert
        const rows = sites.map(s => [
            planning_id,
            s.site_id,
            s.planned_date || null,
            s.effective_date || null,
            s.status || 'planned',
            s.is_delayed ? 1 : 0,
            s.description || null
        ]);

        // Use transaction to ensure atomicity
        const { withTransaction } = require('../utils/databaseUtils');

        await withTransaction(async (connection) => {
            const placeholders = rows.map(() => '(UUID(), ?, ?, ?, ?, ?, ?, ?)').join(', ');
            const flatValues = rows.flat();
            const query = `INSERT INTO planning_sites (id, planning_id, site_id, planned_date, effective_date, status, is_delayed, description) VALUES ${placeholders}`;
            await connection.execute(query, flatValues);
            return true;
        });

        // Return the newly created rows for this planning
        const created = await safeQuery('SELECT * FROM planning_sites WHERE planning_id = ? ORDER BY created_at DESC', [planning_id]);
        res.status(201).json(created);
    } catch (error) {
        console.error('Error creating planning sites batch:', {
            message: error.message,
            code: error.code,
            stack: error.stack
        });
        res.status(500).json({ error: 'Error creating planning sites batch' });
    }
};

module.exports = {
    getAllPlanningSites,
    getPlanningSiteById,
    getPlanningSitesByPlanningId,
    getPlanningSitesBySiteId,
    createPlanningSite,
    createPlanningSitesBatch,
    updatePlanningSite,
    deletePlanningSite,
    getPlanningSitesByStatus,
    deletePlanningSitesByPlanningId
};
