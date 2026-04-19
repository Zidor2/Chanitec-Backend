const { pool } = require('../database/pool');
const { safeQuery } = require('../utils/databaseUtils');

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
        remise,
        hbc,
        parentId,
        split_id
    }) {
        const result = await safeQuery(
            'INSERT INTO quotes (\n'
            + 'id, client_name, site_name, `object`, `date`, supply_description,\n'
            + 'labor_description, supply_exchange_rate, supply_margin_rate,\n'
            + 'labor_exchange_rate, labor_margin_rate, total_supplies_ht,\n'
            + 'total_labor_ht, total_ht, tva, total_ttc, remise, HBC, confirmed, reminderDate, parentId, split_id\n'
            + ') VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                client_name, site_name, object, date, supply_description,
                labor_description, supply_exchange_rate, supply_margin_rate,
                labor_exchange_rate, labor_margin_rate, total_supplies_ht,
                total_labor_ht, total_ht, tva, total_ttc, remise, hbc, confirmed, reminderDate, parentId, split_id
            ]
        );
        return this.findById(result.insertId);
    }

    static async findById(id) {
        const rows = await safeQuery('SELECT * FROM quotes WHERE id = ?', [id]);
        return rows[0];
    }

    static async findAll() {
        const rows = await safeQuery('SELECT * FROM quotes');
        return rows;
    }

    static async update(id, {
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
        remise,
        hbc,
        parentId,
        split_id
    }) {
        await safeQuery(
            'UPDATE quotes SET\n'
            + 'client_name = ?, site_name = ?, `object` = ?, `date` = ?,\n'
            + 'supply_description = ?, labor_description = ?,\n'
            + 'supply_exchange_rate = ?, supply_margin_rate = ?,\n'
            + 'labor_exchange_rate = ?, labor_margin_rate = ?,\n'
            + 'total_supplies_ht = ?, total_labor_ht = ?, total_ht = ?,\n'
            + 'tva = ?, total_ttc = ?, remise = ?, HBC = ?, confirmed = ?, reminderDate = ?, parentId = ?, split_id = ?\n'
            + 'WHERE id = ?',
            [
                client_name, site_name, object, date, supply_description,
                labor_description, supply_exchange_rate, supply_margin_rate,
                labor_exchange_rate, labor_margin_rate, total_supplies_ht,
                total_labor_ht, total_ht, tva, total_ttc, remise, hbc, confirmed, reminderDate, parentId, split_id, id
            ]
        );
        return this.findById(id);
    }

    static async delete(id) {
        await safeQuery('DELETE FROM quotes WHERE id = ?', [id]);
    }

    static async getSupplyItems(quoteId) {
        const rows = await safeQuery('SELECT * FROM supply_items WHERE quote_id = ?', [quoteId]);
        return rows;
    }

    static async getLaborItems(quoteId) {
        const rows = await safeQuery('SELECT * FROM labor_items WHERE quote_id = ?', [quoteId]);
        return rows;
    }
}

module.exports = Quote;