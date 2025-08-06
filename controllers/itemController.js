const { pool } = require('../database/pool');
const { processExcelFile } = require('../utils/excelProcessor');
const { safeQuery, withTransaction } = require('../utils/databaseUtils');

// Get all items
const getAllItems = async (req, res) => {
    try {
        const rows = await safeQuery('SELECT * FROM items ORDER BY created_at DESC');

        // Add debug logging to see what fields are present
        if (rows.length > 0) {
            console.log('Database response - first item fields:', Object.keys(rows[0]));
            console.log('Database response - sample item:', rows[0]);
        } else {
            console.log('Database response: No items found');
        }

        res.json(rows);
    } catch (error) {
        console.error('Error fetching items:', error);
        res.status(500).json({
            error: 'Error fetching items',
            details: error.message
        });
    }
};

// Get item by ID
const getItemById = async (req, res) => {
    try {
        const rows = await safeQuery('SELECT * FROM items WHERE id = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Item not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching item:', error);
        res.status(500).json({
            error: 'Error fetching item',
            details: error.message
        });
    }
};

// Create new item
const createItem = async (req, res) => {
    console.log('Received create item request with body:', req.body);

    const { id, description, price, quantity } = req.body;
    console.log('Extracted values:', { id, description, price, quantity });

    if (!description || !price || quantity === undefined) {
        console.log('Missing required fields. Received:', { description, price, quantity });
        return res.status(400).json({
            error: 'Missing required fields',
            required: ['description', 'price', 'quantity'],
            received: req.body
        });
    }

    try {
        let query, params;

        if (id) {
            // Use custom ID if provided
            console.log('Using custom ID:', id);
            query = 'INSERT INTO items (id, description, price, quantity) VALUES (?, ?, ?, ?)';
            params = [id, description, price, quantity];
        } else {
            // Generate UUID if no custom ID provided
            console.log('Generating UUID for new item');
            query = 'INSERT INTO items (id, description, price, quantity) VALUES (UUID(), ?, ?, ?)';
            params = [description, price, quantity];
        }

        console.log('Attempting to insert item with query:', query, 'and params:', params);
        const result = await safeQuery(query, params);
        console.log('Insert result:', result);

        // Get the newly created item
        let rows;
        if (id) {
            // If custom ID was used, retrieve by that ID
            rows = await safeQuery('SELECT * FROM items WHERE id = ?', [id]);
        } else {
            // If UUID was generated, retrieve by description and most recent
            rows = await safeQuery(
                'SELECT * FROM items WHERE description = ? ORDER BY created_at DESC LIMIT 1',
                [description]
            );
        }
        console.log('Retrieved item:', rows[0]);

        if (rows.length === 0) {
            throw new Error('Failed to retrieve newly created item');
        }

        res.status(201).json(rows[0]);
    } catch (error) {
        console.error('Error creating item:', error);
        res.status(500).json({
            error: 'Error creating item',
            details: error.message
        });
    }
};

// Update item
const updateItem = async (req, res) => {
    const { description, price, quantity } = req.body;

    if (!description || !price || quantity === undefined) {
        return res.status(400).json({
            error: 'Missing required fields',
            required: ['description', 'price', 'quantity']
        });
    }

    try {
        const result = await safeQuery(
            'UPDATE items SET description = ?, price = ?, quantity = ? WHERE id = ?',
            [description, price, quantity, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Item not found' });
        }

        // Get the updated item
        const rows = await safeQuery('SELECT * FROM items WHERE id = ?', [req.params.id]);
        res.json(rows[0]);
    } catch (error) {
        console.error('Error updating item:', error);
        res.status(500).json({
            error: 'Error updating item',
            details: error.message
        });
    }
};

// Delete item
const deleteItem = async (req, res) => {
    try {
        const result = await safeQuery('DELETE FROM items WHERE id = ?', [req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Item not found' });
        }

        res.json({ message: 'Item deleted successfully' });
    } catch (error) {
        console.error('Error deleting item:', error);
        res.status(500).json({
            error: 'Error deleting item',
            details: error.message
        });
    }
};

// Import items from Excel
const importItems = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
        // Process the Excel file
        const processResult = await processExcelFile(req.file);

        // Initialize results tracking
        const results = {
            totalProcessed: processResult.totalRows,
            successful: [],
            failed: [...processResult.invalidItems],
            summary: {
                total: processResult.totalRows,
                valid: processResult.validItems.length,
                invalid: processResult.invalidItems.length,
                imported: 0,
                errors: processResult.invalidItems.length
            }
        };

        // Process valid items one by one
        for (const validItem of processResult.validItems) {
            try {
                const result = await safeQuery(
                    'INSERT INTO items (id, description, price) VALUES (UUID(), ?, ?)',
                    [validItem.item.description, validItem.item.price]
                );

                // Get the newly created item
                const rows = await safeQuery(
                    'SELECT * FROM items WHERE description = ? ORDER BY created_at DESC LIMIT 1',
                    [validItem.item.description]
                );

                results.successful.push({
                    rowIndex: validItem.rowIndex,
                    item: rows[0],
                    rawData: validItem.rawData
                });
                results.summary.imported++;
            } catch (error) {
                results.failed.push({
                    rowIndex: validItem.rowIndex,
                    error: `Database insertion failed: ${error.message}`,
                    rawData: validItem.rawData
                });
                results.summary.errors++;
            }
        }

        return res.status(200).json({
            message: 'Import completed',
            results: results
        });
    } catch (error) {
        console.error('Import error:', error);
        return res.status(500).json({
            error: 'Error processing import',
            details: error.message
        });
    }
};

// Clear all items
const clearItems = async (req, res) => {
        try {
        const result = await safeQuery('DELETE FROM items');
        res.json({
            message: 'All items cleared successfully',
            deletedCount: result.affectedRows
        });
    } catch (error) {
        console.error('Error clearing items:', error);
        res.status(500).json({
            error: 'Error clearing items',
            details: error.message
        });
    }
};

module.exports = {
    getAllItems,
    getItemById,
    createItem,
    updateItem,
    deleteItem,
    importItems,
    clearItems
};