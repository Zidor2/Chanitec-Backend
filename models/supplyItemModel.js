const { pool } = require('../database/pool');
const { safeQuery } = require('../utils/databaseUtils');

class SupplyItem {
    static async create({
        quote_id,
        description,
        quantity,
        price_euro,
        price_dollar,
        unit_price_dollar,
        total_price_dollar
    }) {
        const result = await safeQuery(
            `INSERT INTO supply_items (
                id, quote_id, description, quantity, price_euro,
                price_dollar, unit_price_dollar, total_price_dollar
            ) VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?)`,
            [
                quote_id, description, quantity, price_euro,
                price_dollar, unit_price_dollar, total_price_dollar
            ]
        );
        return this.findById(result.insertId);
    }

    static async findById(id) {
        const rows = await safeQuery('SELECT * FROM supply_items WHERE id = ?', [id]);
        return rows[0];
    }

    static async findByQuoteId(quoteId) {
        const rows = await safeQuery('SELECT * FROM supply_items WHERE quote_id = ?', [quoteId]);
        return rows;
    }

    static async update(id, {
        description,
        quantity,
        price_euro,
        price_dollar,
        unit_price_dollar,
        total_price_dollar
    }) {
        await safeQuery(
            `UPDATE supply_items SET
                description = ?, quantity = ?, price_euro = ?,
                price_dollar = ?, unit_price_dollar = ?, total_price_dollar = ?
            WHERE id = ?`,
            [
                description, quantity, price_euro,
                price_dollar, unit_price_dollar, total_price_dollar, id
            ]
        );
        return this.findById(id);
    }

    static async delete(id) {
        await safeQuery('DELETE FROM supply_items WHERE id = ?', [id]);
    }

    static async getQuote(supplyItemId) {
        const rows = await safeQuery(
            'SELECT q.* FROM quotes q JOIN supply_items s ON q.id = s.quote_id WHERE s.id = ?',
            [supplyItemId]
        );
        return rows[0];
    }
}

module.exports = SupplyItem;