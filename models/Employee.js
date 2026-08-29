const { pool } = require('../database/pool');
const { safeQuery } = require('../utils/databaseUtils');

class Employee {
    static async create({ full_name, civil_status, birth_date, entry_date, seniority, contract_type, job_title, fonction, sub_type_id, type_description }) {
        const result = await safeQuery(
            'INSERT INTO employee (full_name, civil_status, birth_date, entry_date, seniority, contract_type, job_title, fonction, sub_type_id, type_description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [full_name, civil_status, birth_date, entry_date, seniority, contract_type, job_title, fonction, sub_type_id, type_description]
        );
        return this.findById(result.insertId);
    }

    static async findById(id) {
        const rows = await safeQuery('SELECT * FROM employee WHERE id = ?', [id]);
        if (!rows[0]) return rows[0];
        const { computeTechnicianScores } = require('../utils/technicianScore');
        const scoresById = await computeTechnicianScores();
        const employeeId = Number(rows[0].id);
        return {
            ...rows[0],
            score: scoresById.has(employeeId) ? scoresById.get(employeeId) : (rows[0].score ?? null)
        };
    }

    static async findAll() {
        const rows = await safeQuery('SELECT * FROM employee');
        const { computeTechnicianScores } = require('../utils/technicianScore');
        const scoresById = await computeTechnicianScores();
        return rows.map((row) => {
            const employeeId = Number(row.id);
            return {
                ...row,
                score: scoresById.has(employeeId) ? scoresById.get(employeeId) : (row.score ?? null)
            };
        });
    }

    static async update(id, { full_name, civil_status, birth_date, entry_date, seniority, contract_type, job_title, fonction, sub_type_id, type_description }) {
        await safeQuery(
            'UPDATE employee SET full_name = ?, civil_status = ?, birth_date = ?, entry_date = ?, seniority = ?, contract_type = ?, job_title = ?, fonction = ?, sub_type_id = ?, type_description = ? WHERE id = ?',
            [full_name, civil_status, birth_date, entry_date, seniority, contract_type, job_title, fonction, sub_type_id, type_description, id]
        );
        return this.findById(id);
    }

    static async delete(id) {
        await safeQuery('DELETE FROM employee WHERE id = ?', [id]);
    }
}

module.exports = Employee;