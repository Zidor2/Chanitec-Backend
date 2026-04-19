const { pool } = require('../database/pool');
const { safeQuery } = require('../utils/databaseUtils');

// Get all descriptions
const getAllDescriptions = async (req, res) => {
    try {
        const rows = await safeQuery('SELECT * FROM comments');
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
        const { content } = req.body;

    try {
        const result = await safeQuery(
            'INSERT INTO comments (content) VALUES (?)',
            [content]
        );
        res.status(201).json({ id: result.insertId, content });
    } catch (error) {
        console.error('Error creating client:', error);
        res.status(500).json({
            error: 'Error creating client',
            details: error.message
        });
    }
};


module.exports = {
    getAllDescriptions,
    createDescription
};
