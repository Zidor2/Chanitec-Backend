const pool = require('../database/pool');

class Quote {
    static async create({
        client_name,
        site_name,
        object,
        date,
        supply_description,
        labor_description,
        supply_exchange_rate,
        supply_margin_rate,
        labor_exchange_rate,
        labor_margin_rate,
        total_supplies_ht,
        confirmed,
        reminderDate,
        total_labor_ht,
        total_ht,
        tva,
        total_ttc,
        version
    }) {
        const [result] = await pool.query(
            `INSERT INTO quotes (
                id, client_name, site_name, object, date, supply_description,
                labor_description, supply_exchange_rate, supply_margin_rate,
                labor_exchange_rate, labor_margin_rate, total_supplies_ht,
                total_labor_ht, total_ht, tva, total_ttc, confirmed, reminderDate, version
            ) VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                client_name, site_name, object, date, supply_description,
                labor_description, supply_exchange_rate, supply_margin_rate,
                labor_exchange_rate, labor_margin_rate, total_supplies_ht,
                total_labor_ht, total_ht, tva, total_ttc, confirmed, reminderDate, version
            ]
        );
        return this.findById(result.insertId);
    }

    static async findById(id, created_at) {
        const [rows] = await pool.query('SELECT * FROM quotes WHERE id = ? AND created_at = ?', [id, created_at]);
        return rows[0];
    }

    static async findAll() {
        const [rows] = await pool.query('SELECT * FROM quotes');
        return rows;
    }

    static async update(id, created_at, {
        client_name,
        site_name,
        object,
        date,
        supply_description,
        labor_description,
        supply_exchange_rate,
        supply_margin_rate,
        labor_exchange_rate,
        labor_margin_rate,
        total_supplies_ht,
        total_labor_ht,
        total_ht,
        confirmed,
        reminderDate,
        tva,
        total_ttc,
        version
    }) {
        await pool.query(
            `UPDATE quotes SET
                client_name = ?, site_name = ?, object = ?, date = ?,
                supply_description = ?, labor_description = ?,
                supply_exchange_rate = ?, supply_margin_rate = ?,
                labor_exchange_rate = ?, labor_margin_rate = ?,
                total_supplies_ht = ?, total_labor_ht = ?, total_ht = ?,
                tva = ?, total_ttc = ?, confirmed = ?, reminderDate = ?, version = ?
            WHERE id = ? AND created_at = ?`,
            [
                client_name, site_name, object, date, supply_description,
                labor_description, supply_exchange_rate, supply_margin_rate,
                labor_exchange_rate, labor_margin_rate, total_supplies_ht,
                total_labor_ht, total_ht, tva, total_ttc, confirmed, reminderDate, version, id, created_at
            ]
        );
        return this.findById(id, created_at);
    }

    static async delete(id, created_at) {
        await pool.query('DELETE FROM quotes WHERE id = ? AND created_at = ?', [id, created_at]);
    }

    static async getSupplyItems(quoteId) {
        const [rows] = await pool.query('SELECT * FROM supply_items WHERE quote_id = ?', [quoteId]);
        return rows;
    }

    static async getLaborItems(quoteId) {
        const [rows] = await pool.query('SELECT * FROM labor_items WHERE quote_id = ?', [quoteId]);
        return rows;
    }
}

module.exports = Quote;