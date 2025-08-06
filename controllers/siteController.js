const { pool } = require('../database/pool');
const { safeQuery } = require('../utils/databaseUtils');

// Get site by ID
const getSiteById = async (req, res) => {
    try {
        const rows = await safeQuery('SELECT * FROM sites WHERE id = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Site not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching site:', error);
        res.status(500).json({ error: 'Error fetching site' });
    }
};

// Get sites by client ID
const getSitesByClientId = async (req, res) => {
    console.log('🔍 Request query:', req.query);
    console.log('🔍 Request params:', req.params);

    const client_id = req.query.clientId || req.params.clientId;

    if (!client_id) {
        return res.status(400).json({ error: 'Client ID is required' });
    }

    console.log('🔍 Looking for client_id:', client_id);

        try {
        // First check if the client exists
        if (!client_id || client_id === 'undefined' || client_id === 'null') {
            return res.status(400).json({ error: 'Invalid client ID provided' });
        }

        console.log('🔍 Executing client query with client_id:', client_id);
        const clientRows = await safeQuery('SELECT * FROM clients WHERE id = ?', [client_id]);

        if (clientRows.length === 0) {
            return res.status(404).json({ error: 'Client not found with ID: ' + client_id });
        }

        console.log('🔍 Executing sites query with client_id:', client_id);
        const rows = await safeQuery('SELECT * FROM sites WHERE client_id = ?', [client_id]);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching sites by client:', error);
        res.status(500).json({ error: 'Error fetching sites by client' });
    }
};

// Create new site
const createSite = async (req, res) => {
    const { name, client_id } = req.body;
    if (!name || !client_id) {
        return res.status(400).json({ error: 'Name and client_id are required' });
    }

    try {
        // Perform the insertion
        const result = await safeQuery(
            'INSERT INTO sites (id, name, client_id) VALUES (UUID(), ?, ?)',
            [name, client_id]
        );

        // Retrieve the newly created site using the known name and client_id
        // Order by created_at descending and limit 1 to get the most recent one
        const rows = await safeQuery(
            'SELECT * FROM sites WHERE name = ? AND client_id = ? ORDER BY created_at DESC LIMIT 1',
            [name, client_id]
        );

        if (rows.length === 0) {
            // This should theoretically not happen if the INSERT succeeded
            throw new Error('Failed to retrieve newly created site immediately after insertion.');
        }

        // Return the complete site object
        res.status(201).json(rows[0]);

    } catch (error) {
        console.error('Error creating site:', error);
        res.status(500).json({
            error: 'Error creating site',
            details: error.message
        });
    }
};

// Update site
const updateSite = async (req, res) => {
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ error: 'Name is required' });
    }

    try {
        const result = await safeQuery(
            'UPDATE sites SET name = ? WHERE id = ?',
            [name, req.params.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Site not found' });
        }
        const updatedSite = await safeQuery('SELECT * FROM sites WHERE id = ?', [req.params.id]);
        res.json(updatedSite[0]);
    } catch (error) {
        console.error('Error updating site:', error);
        res.status(500).json({ error: 'Error updating site' });
    }
};

// Delete site
const deleteSite = async (req, res) => {
    try {
        const result = await safeQuery('DELETE FROM sites WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Site not found' });
        }
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting site:', error);
        res.status(500).json({ error: 'Error deleting site' });
    }
};

module.exports = {
    getSiteById,
    getSitesByClientId,
    createSite,
    updateSite,
    deleteSite
};