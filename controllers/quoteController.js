const { pool } = require('../database/pool');
const { safeQuery } = require('../utils/databaseUtils');
const crypto = require('crypto');

// Get all quotes
const getAllQuotes = async (req, res) => {
    try {
        console.log('[DEBUG] getAllQuotes - Fetching all quotes');
        const rows = await safeQuery('SELECT *, HBC AS hbc FROM quotes ORDER BY date DESC, created_at DESC');

        console.log(`[DEBUG] getAllQuotes - Retrieved ${rows.length} quotes from database`);

        // Convert field names from snake_case to camelCase for frontend
        const quotes = rows.map(row => ({
            id: row.id,
            clientName: row.client_name,
            siteName: row.site_name,
            object: row.object,
            date: row.date,
            reminderDate: row.reminderDate,
            confirmed: row.confirmed,
            supplyDescription: row.supply_description,
            laborDescription: row.labor_description,
            supplyExchangeRate: row.supply_exchange_rate,
            supplyMarginRate: row.supply_margin_rate,
            laborExchangeRate: row.labor_exchange_rate,
            laborMarginRate: row.labor_margin_rate,
            totalSuppliesHT: row.total_supplies_ht,
            totalLaborHT: row.total_labor_ht,
            totalHT: row.total_ht,
            tva: row.tva,
            totalTTC: row.total_ttc,
            remise: row.remise,
            hbc: row.hbc,
            parentId: row.parentId,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            splitId: row.split_id,
        }));

        console.log('[DEBUG] getAllQuotes - Sending formatted quotes to frontend');
        res.json(quotes);
    } catch (error) {
        console.error('Error fetching quotes:', error);
        res.status(500).json({ error: 'Error fetching quotes' });
    }
};

// Get quote by ID
const getQuoteById = async (req, res) => {
    try {
        console.log(`[DEBUG] getQuoteById - Fetching quote with ID: ${req.params.id}`);

        // Get the quote
        const quoteRows = await safeQuery('SELECT *, HBC AS hbc FROM quotes WHERE id = ?', [req.params.id]);

        if (quoteRows.length === 0) {
            console.log(`[DEBUG] getQuoteById - Quote not found for ID: ${req.params.id}`);
            return res.status(404).json({ error: 'Quote not found' });
        }

        console.log(`[DEBUG] getQuoteById - Found quote ID: ${quoteRows[0].id}, Client: ${quoteRows[0].client_name}`);

        // Get supply items for this quote
        const supplyItems = await safeQuery(
            'SELECT * FROM supply_items WHERE quote_id = ?',
            [req.params.id]
        );

        console.log(`[DEBUG] getQuoteById - Retrieved ${supplyItems.length} supply items`);

        // Get labor items for this quote
        const laborItems = await safeQuery(
            'SELECT * FROM labor_items WHERE quote_id = ?',
            [req.params.id]
        );

        console.log(`[DEBUG] getQuoteById - Retrieved ${laborItems.length} labor items`);

        // Format the response
        const quote = {
            id: quoteRows[0].id,
            clientName: quoteRows[0].client_name,
            siteName: quoteRows[0].site_name,
            object: quoteRows[0].object,
            date: quoteRows[0].date,
            supplyDescription: quoteRows[0].supply_description,
            laborDescription: quoteRows[0].labor_description,
            supplyExchangeRate: quoteRows[0].supply_exchange_rate,
            supplyMarginRate: quoteRows[0].supply_margin_rate,
            laborExchangeRate: quoteRows[0].labor_exchange_rate,
            laborMarginRate: quoteRows[0].labor_margin_rate,
            totalSuppliesHT: quoteRows[0].total_supplies_ht,
            totalLaborHT: quoteRows[0].total_labor_ht,
            totalHT: quoteRows[0].total_ht,
            tva: quoteRows[0].tva,
            totalTTC: quoteRows[0].total_ttc,
            remise: quoteRows[0].remise,
            hbc: quoteRows[0].hbc,
            parentId: quoteRows[0].parentId,
            createdAt: quoteRows[0].created_at,
            updatedAt: quoteRows[0].updated_at,
            splitId: quoteRows[0].split_id,
            supplyItems: supplyItems.map(item => ({
                id: item.id,
                item_id: item.item_id,
                description: item.description,
                quantity: item.quantity,
                priceEuro: item.price_euro,
                priceDollar: item.price_dollar,
                unitPriceDollar: item.unit_price_dollar,
                totalPriceDollar: item.total_price_dollar
            })),
            laborItems: laborItems.map(item => ({
                id: item.id,
                description: item.description,
                nbTechnicians: item.nb_technicians,
                nbHours: item.nb_hours,
                weekendMultiplier: item.weekend_multiplier,
                priceEuro: item.price_euro,
                priceDollar: item.price_dollar,
                unitPriceDollar: item.unit_price_dollar,
                totalPriceDollar: item.total_price_dollar
            }))
        };

        console.log(`[DEBUG] getQuoteById - Quote formatted successfully with remise: ${quote.remise}, hbc: ${quote.hbc}`);
        console.log('[DEBUG] getQuoteById - Sending quote response to frontend');
        res.json(quote);
    } catch (error) {
        console.error('Error getting quote:', error);
        res.status(500).json({ error: 'Error getting quote' });
    }
};


const setReminderDate = async (req, res) => {
    const { reminderDate } = req.body;

    try {
        // Validate date format
        if (!reminderDate || !Date.parse(reminderDate)) {
            return res.status(400).json({ error: 'Invalid reminder date format' });
        }

        const result = await safeQuery(
            'UPDATE quotes SET reminderDate = ? WHERE id = ?',
            [reminderDate, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Quote not found' });
        }

        // Return the updated quote
        const updatedQuote = await safeQuery('SELECT *, HBC AS hbc FROM quotes WHERE id = ?', [req.params.id]);

        // Format response to camelCase
        const formattedQuote = {
            id: updatedQuote[0].id,
            clientName: updatedQuote[0].client_name,
            siteName: updatedQuote[0].site_name,
            object: updatedQuote[0].object,
            date: updatedQuote[0].date,
            supplyDescription: updatedQuote[0].supply_description,
            laborDescription: updatedQuote[0].labor_description,
            supplyExchangeRate: updatedQuote[0].supply_exchange_rate,
            supplyMarginRate: updatedQuote[0].supply_margin_rate,
            laborExchangeRate: updatedQuote[0].labor_exchange_rate,
            laborMarginRate: updatedQuote[0].labor_margin_rate,
            totalSuppliesHT: updatedQuote[0].total_supplies_ht,
            totalLaborHT: updatedQuote[0].total_labor_ht,
            totalHT: updatedQuote[0].total_ht,
            tva: updatedQuote[0].tva,
            totalTTC: updatedQuote[0].total_ttc,
            remise: updatedQuote[0].remise,
            hbc: updatedQuote[0].hbc,
            parentId: updatedQuote[0].parentId,
            confirmed: updatedQuote[0].confirmed,
            reminderDate: updatedQuote[0].reminderDate,
            splitId: updatedQuote[0].split_id,
            createdAt: updatedQuote[0].created_at,
            updatedAt: updatedQuote[0].updated_at,
        };

        res.json(formattedQuote);
    } catch (error) {
        console.error('Error setting reminder date:', error);
        res.status(500).json({ error: 'Error setting reminder date' });
    }
};

const confirmQuote = async (req, res) => {
    const { confirmed, number_chanitec } = req.body;

    try {
        console.log(`[DEBUG] confirmQuote - Request received for quote ID: ${req.params.id}`);
        console.log(`[DEBUG] confirmQuote - Payload: confirmed=${confirmed}, number_chanitec=${number_chanitec}`);

        // Validate confirmed value
        if (typeof confirmed !== 'boolean') {
            console.log(`[DEBUG] confirmQuote - Validation failed: confirmed is not boolean`);
            return res.status(400).json({ error: 'Confirmed status must be a boolean' });
        }
        // Validate number_chanitec (optional: you can add more validation)
        if (!number_chanitec || typeof number_chanitec !== 'string') {
            console.log(`[DEBUG] confirmQuote - Validation failed: number_chanitec missing or not string`);
            return res.status(400).json({ error: 'number_chanitec is required and must be a string' });
        }

        // Start a transaction for atomicity
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            console.log(`[DEBUG] confirmQuote - Updating quote confirmation status...`);
            // Update quote confirmation status
            const [result] = await connection.execute(
                'UPDATE quotes SET confirmed = ?, number_chanitec = ? WHERE id = ?',
                [confirmed, number_chanitec, req.params.id]
            );

            if (result.affectedRows === 0) {
                await connection.rollback();
                connection.release();
                console.log(`[DEBUG] confirmQuote - Quote not found for ID: ${req.params.id}`);
                return res.status(404).json({ error: 'Quote not found' });
            }

            console.log(`[DEBUG] confirmQuote - Quote updated successfully. Confirmed: ${confirmed}, Number: ${number_chanitec}`);

            // If confirming the quote, deduct inventory for supply items
            if (confirmed) {
                console.log(`[DEBUG] confirmQuote - Confirming quote ${req.params.id}, deducting inventory...`);

                // Get supply items for this quote
                const [supplyItems] = await connection.execute(
                    'SELECT * FROM supply_items WHERE quote_id = ?',
                    [req.params.id]
                );

                console.log(`Found ${supplyItems.length} supply items for quote ${req.params.id}`);

                // Deduct inventory for each supply item
                for (const item of supplyItems) {
                    console.log(`Processing supply item:`, {
                        id: item.id,
                        item_id: item.item_id,
                        description: item.description,
                        quantity: item.quantity
                    });

                    if (item.item_id) {
                        // Get current item quantity
                        const [currentItem] = await connection.execute(
                            'SELECT quantity FROM items WHERE id = ?',
                            [item.item_id]
                        );

                        if (currentItem.length > 0) {
                            const currentQuantity = currentItem[0].quantity || 0;
                            const newQuantity = currentQuantity - item.quantity;

                            // Update item quantity (allow negative values)
                            await connection.execute(
                                'UPDATE items SET quantity = ? WHERE id = ?',
                                [newQuantity, item.item_id]
                            );

                            console.log(`Deducted ${item.quantity} from item ${item.item_id}. Quantity: ${currentQuantity} -> ${newQuantity}`);
                        } else {
                            console.warn(`Item ${item.item_id} not found in catalog`);
                        }
                    } else {
                        console.warn(`Supply item ${item.id} has no item_id, skipping inventory deduction`);
                    }
                }
            }

            // Commit the transaction
            await connection.commit();
            connection.release();

            console.log(`[DEBUG] confirmQuote - Transaction committed successfully for quote ${req.params.id}`);
            res.json({ message: 'Quote confirmation status and number_chanitec updated successfully' });
        } catch (error) {
            await connection.rollback();
            connection.release();
            console.error(`[DEBUG] confirmQuote - Transaction rollback: ${error.message}`);
            throw error;
        }
    } catch (error) {
        console.error('Error updating quote confirmation:', error);
        res.status(500).json({ error: 'Error updating quote confirmation' });
    }
};

// Create new quote
const createQuote = async (req, res) => {
    console.log('[DEBUG] createQuote - Request received');
    console.log('[DEBUG] createQuote - === CREATE QUOTE REQUEST BODY ===');
    console.log(JSON.stringify(req.body, null, 2));
    console.log('[DEBUG] createQuote - === END REQUEST BODY ===');

    // Start a transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
        console.log('[DEBUG] createQuote - Checking for duplicate quote...');
        // 1. Check for duplicate quote
        const [existingQuotes] = await connection.execute(
  `SELECT id FROM quotes WHERE
    client_name = ? AND
    site_name = ? AND
    \`object\` = ? AND
    \`date\` = ? AND
    supply_description = ? AND
    labor_description = ? AND
    supply_exchange_rate = ? AND
    supply_margin_rate = ? AND
    labor_exchange_rate = ? AND
    labor_margin_rate = ? AND
    total_supplies_ht = ? AND
    total_labor_ht = ? AND
    total_ht = ? AND
    tva = ? AND
    total_ttc = ? AND
    parentId = ? AND
    split_id = ?`,
  [             req.body.clientName,
                req.body.siteName,
                req.body.object,
                req.body.date,
                req.body.supplyDescription,
                req.body.laborDescription,
                req.body.supplyExchangeRate,
                req.body.supplyMarginRate,
                req.body.laborExchangeRate,
                req.body.laborMarginRate,
                req.body.totalSuppliesHT,
                req.body.totalLaborHT,
                req.body.totalHT,
                req.body.tva,
                req.body.totalTTC,
                req.body.parentId || 0,
                req.body.splitId || null
            ]
        );

        if (existingQuotes.length > 0) {
            console.log(`[DEBUG] createQuote - Duplicate quote found! ID: ${existingQuotes[0].id}`);
            await connection.rollback();
            return res.status(400).json({
                error: 'A quote with these exact details already exists',
                existingQuoteId: existingQuotes[0].id
            });
        }

        console.log('[DEBUG] createQuote - No duplicates found. Proceeding with creation...');

        // 2. Create the quote
        const quoteData = {
            client_name: req.body.clientName,
            site_name: req.body.siteName,
            object: req.body.object,
            date: req.body.date,
            supply_description: req.body.supplyDescription,
            labor_description: req.body.laborDescription,
            supply_exchange_rate: req.body.supplyExchangeRate,
            supply_margin_rate: req.body.supplyMarginRate,
            labor_exchange_rate: req.body.laborExchangeRate,
            labor_margin_rate: req.body.laborMarginRate,
            total_supplies_ht: req.body.totalSuppliesHT,
            total_labor_ht: req.body.totalLaborHT,
            total_ht: req.body.totalHT,
            tva: req.body.tva,
            total_ttc: req.body.totalTTC,
            remise: req.body.remise || 0,
            hbc: req.body.hbc || 0,
            parentId: req.body.parentId || 0,
            split_id: req.body.splitId || null
        };

        // Generate quote ID
        const quoteId = req.body.id || crypto.randomUUID();
        console.log(`[DEBUG] createQuote - Generated quote ID: ${quoteId}`);
        console.log(`[DEBUG] createQuote - Quote data: remise=${quoteData.remise}, hbc=${quoteData.hbc}`);

        // Insert quote
        console.log('[DEBUG] createQuote - Inserting quote into database...');
        const [quoteResult] = await connection.execute(
            'INSERT INTO quotes (\n'
            + 'id, client_name, site_name, `object`, `date`,\n'
            + 'supply_description, labor_description,\n'
            + 'supply_exchange_rate, supply_margin_rate,\n'
            + 'labor_exchange_rate, labor_margin_rate,\n'
            + 'total_supplies_ht, total_labor_ht, total_ht,\n'
            + 'tva, total_ttc, remise, HBC, `parentId`, split_id\n'
            + ') VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                quoteId,
                quoteData.client_name,
                quoteData.site_name,
                quoteData.object,
                quoteData.date,
                quoteData.supply_description,
                quoteData.labor_description,
                quoteData.supply_exchange_rate,
                quoteData.supply_margin_rate,
                quoteData.labor_exchange_rate,
                quoteData.labor_margin_rate,
                quoteData.total_supplies_ht,
                quoteData.total_labor_ht,
                quoteData.total_ht,
                quoteData.tva,
                quoteData.total_ttc,
                quoteData.remise,
                quoteData.hbc,
                quoteData.parentId || 0,
                quoteData.split_id
            ]
        );

        // 2. Insert supply items
        if (req.body.supplyItems && req.body.supplyItems.length > 0) {
            console.log(`[DEBUG] createQuote - Inserting ${req.body.supplyItems.length} supply items...`);
            for (const item of req.body.supplyItems) {
                await connection.execute(
                    `INSERT INTO supply_items (
                        id, quote_id, item_id, description, quantity,
                        price_euro, price_dollar, unit_price_dollar,
                        total_price_dollar
                    ) VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        quoteId,
                        item.item_id || null,
                        item.description,
                        item.quantity,
                        item.priceEuro,
                        item.priceDollar,
                        item.unitPriceDollar,
                        item.totalPriceDollar
                    ]
                );
            }
        }

        // 3. Insert labor items
        if (req.body.laborItems && req.body.laborItems.length > 0) {
            console.log(`[DEBUG] createQuote - Inserting ${req.body.laborItems.length} labor items...`);
            for (const item of req.body.laborItems) {
                await connection.execute(
                    `INSERT INTO labor_items (
                        id, quote_id, description, nb_technicians,
                        nb_hours, weekend_multiplier, price_euro,
                        price_dollar, unit_price_dollar, total_price_dollar
                    ) VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        quoteId,
                        item.description,
                        item.nbTechnicians,
                        item.nbHours,
                        item.weekendMultiplier,
                        item.priceEuro,
                        item.priceDollar,
                        item.unitPriceDollar,
                        item.totalPriceDollar
                    ]
                );
            }
        }

        // Commit the transaction
        console.log('[DEBUG] createQuote - Committing transaction...');
        await connection.commit();
        console.log(`[DEBUG] createQuote - Transaction committed successfully. Quote ${quoteId} created.`);

        // 4. Fetch the complete quote with items
        const [quoteRows] = await connection.execute('SELECT *, HBC AS hbc FROM quotes WHERE id = ?', [quoteId]);
        const [supplyItems] = await connection.execute('SELECT * FROM supply_items WHERE quote_id = ?', [quoteId]);
        const [laborItems] = await connection.execute('SELECT * FROM labor_items WHERE quote_id = ?', [quoteId]);

        console.log(`[DEBUG] createQuote - Quote fetched: remise=${quoteRows[0].remise}, hbc=${quoteRows[0].hbc}`);

        // Convert to frontend format
        const savedQuote = {
            id: quoteRows[0].id,
            clientName: quoteRows[0].client_name,
            siteName: quoteRows[0].site_name,
            object: quoteRows[0].object,
            date: quoteRows[0].date,
            supplyDescription: quoteRows[0].supply_description,
            laborDescription: quoteRows[0].labor_description,
            supplyExchangeRate: quoteRows[0].supply_exchange_rate,
            supplyMarginRate: quoteRows[0].supply_margin_rate,
            laborExchangeRate: quoteRows[0].labor_exchange_rate,
            laborMarginRate: quoteRows[0].labor_margin_rate,
            totalSuppliesHT: quoteRows[0].total_supplies_ht,
            totalLaborHT: quoteRows[0].total_labor_ht,
            totalHT: quoteRows[0].total_ht,
            tva: quoteRows[0].tva,
            totalTTC: quoteRows[0].total_ttc,
            remise: quoteRows[0].remise,
            hbc: quoteRows[0].hbc,
            parentId: quoteRows[0].parentId,
            createdAt: quoteRows[0].created_at,
            updatedAt: quoteRows[0].updated_at,
            supplyItems: supplyItems.map(item => ({
                id: item.id,
                description: item.description,
                quantity: item.quantity,
                priceEuro: item.price_euro,
                priceDollar: item.price_dollar,
                unitPriceDollar: item.unit_price_dollar,
                totalPriceDollar: item.total_price_dollar
            })),
            laborItems: laborItems.map(item => ({
                id: item.id,
                description: item.description,
                nbTechnicians: item.nb_technicians,
                nbHours: item.nb_hours,
                weekendMultiplier: item.weekend_multiplier,
                priceEuro: item.price_euro,
                priceDollar: item.price_dollar,
                unitPriceDollar: item.unit_price_dollar,
                totalPriceDollar: item.total_price_dollar
            }))
        };

        console.log(`[DEBUG] createQuote - Quote successfully created and formatted. Sending response with remise=${savedQuote.remise}, hbc=${savedQuote.hbc}`);
        res.status(201).json(savedQuote);

    } catch (error) {
        // Rollback the transaction on error
        await connection.rollback();
        console.error('[DEBUG] createQuote - Error occurred, rolling back transaction:', error);
        console.error('Error creating quote:', error);
        res.status(500).json({
            error: 'Error creating quote',
            details: error.message
        });
    } finally {
        connection.release();
    }
};

// Update quote
const updateQuote = async (req, res) => {
    // Log the entire request body
    console.log('[DEBUG] updateQuote - Request received for quote ID:', req.params.id);
    console.log('[DEBUG] updateQuote - === UPDATE QUOTE REQUEST BODY ===');
    console.log(JSON.stringify(req.body, null, 2));
    console.log('[DEBUG] updateQuote - === END REQUEST BODY ===');

    // Map camelCase from frontend to snake_case for database
    const {
        clientName,
        siteName,
        object,
        date,
        supplyDescription,
        laborDescription,
        supplyExchangeRate,
        supplyMarginRate,
        laborExchangeRate,
        laborMarginRate,
        totalSuppliesHT,
        totalLaborHT,
        totalHT,
        tva,
        totalTTC,
        remise,
        hbc,
        confirmed,
        reminderDate,
        parentId,
        splitId
    } = req.body;

    // Validate required fields
    if (!clientName || !siteName || !date || !supplyExchangeRate || !supplyMarginRate ||
        !laborExchangeRate || !laborMarginRate || !totalSuppliesHT || !totalLaborHT ||
        !totalHT || !tva || !totalTTC) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        console.log(`[DEBUG] updateQuote - Updating quote ID: ${req.params.id} with remise=${remise || 0}, hbc=${hbc || 0}`);
        const result = await safeQuery(
            `UPDATE quotes SET
                client_name = ?, site_name = ?, object = ?, date = ?,
                supply_description = ?, labor_description = ?,
                supply_exchange_rate = ?, supply_margin_rate = ?,
                labor_exchange_rate = ?, labor_margin_rate = ?,
                total_supplies_ht = ?, total_labor_ht = ?, total_ht = ?,
                tva = ?, total_ttc = ?, remise = ?, HBC = ?, confirmed = ?, reminderDate = ?,
                parentId = ?, split_id = ?
            WHERE id = ?`,
            [
                clientName, siteName, object, date, supplyDescription, laborDescription,
                supplyExchangeRate, supplyMarginRate, laborExchangeRate, laborMarginRate,
                totalSuppliesHT, totalLaborHT, totalHT, tva, totalTTC, remise || 0,
                hbc || 0, confirmed || false, reminderDate || null, parentId || null, splitId || null,
                req.params.id
            ]
        );
        if (result.affectedRows === 0) {
            console.log(`[DEBUG] updateQuote - Quote not found for ID: ${req.params.id}`);
            return res.status(404).json({ error: 'Quote not found' });
        }
        console.log(`[DEBUG] updateQuote - Quote updated successfully. Fetching updated data...`);
        const updatedQuote = await safeQuery('SELECT *, HBC AS hbc FROM quotes WHERE id = ?', [req.params.id]);

        // Format response to camelCase for frontend (same as createQuote)
        const formattedQuote = {
            id: updatedQuote[0].id,
            clientName: updatedQuote[0].client_name,
            siteName: updatedQuote[0].site_name,
            object: updatedQuote[0].object,
            date: updatedQuote[0].date,
            supplyDescription: updatedQuote[0].supply_description,
            laborDescription: updatedQuote[0].labor_description,
            supplyExchangeRate: updatedQuote[0].supply_exchange_rate,
            supplyMarginRate: updatedQuote[0].supply_margin_rate,
            laborExchangeRate: updatedQuote[0].labor_exchange_rate,
            laborMarginRate: updatedQuote[0].labor_margin_rate,
            totalSuppliesHT: updatedQuote[0].total_supplies_ht,
            totalLaborHT: updatedQuote[0].total_labor_ht,
            totalHT: updatedQuote[0].total_ht,
            tva: updatedQuote[0].tva,
            totalTTC: updatedQuote[0].total_ttc,
            remise: updatedQuote[0].remise,
            hbc: updatedQuote[0].hbc,
            parentId: updatedQuote[0].parentId,
            confirmed: updatedQuote[0].confirmed,
            reminderDate: updatedQuote[0].reminderDate,
            splitId: updatedQuote[0].split_id,
            createdAt: updatedQuote[0].created_at,
            updatedAt: updatedQuote[0].updated_at,
        };

        console.log(`[DEBUG] updateQuote - Quote formatted and sending response with hbc=${formattedQuote.hbc}`);
        res.json(formattedQuote);
    } catch (error) {
        console.error('Error updating quote:', error);
        res.status(500).json({ error: 'Error updating quote' });
    }
};

// Delete quote
const deleteQuote = async (req, res) => {
    try {
        console.log(`[DEBUG] deleteQuote - Deleting quote ID: ${req.params.id}`);
        const result = await safeQuery('DELETE FROM quotes WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) {
            console.log(`[DEBUG] deleteQuote - Quote not found for ID: ${req.params.id}`);
            return res.status(404).json({ error: 'Quote not found' });
        }
        console.log(`[DEBUG] deleteQuote - Quote deleted successfully: ${req.params.id}`);
        res.status(204).send();
    } catch (error) {
        console.error('[DEBUG] deleteQuote - Error:', error);
        console.error('Error deleting quote:', error);
        res.status(500).json({ error: 'Error deleting quote' });
    }
};

module.exports = {
    getAllQuotes,
    getQuoteById,
    createQuote,
    updateQuote,
    deleteQuote,
    setReminderDate,
    confirmQuote
};