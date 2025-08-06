const { pool } = require('../database/pool');

class Employee {
    static async create({ full_name, civil_status, birth_date, entry_date, seniority, contract_type, job_title, fonction, sub_type_id, type_description }) {
        const [result] = await pool.query(
            'INSERT INTO employee (full_name, civil_status, birth_date, entry_date, seniority, contract_type, job_title, fonction, sub_type_id, type_description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [full_name, civil_status, birth_date, entry_date, seniority, contract_type, job_title, fonction, sub_type_id, type_description]
        );
        return this.findById(result.insertId);
    }

    static async findById(id) {
        const [rows] = await pool.query('SELECT * FROM employee WHERE id = ?', [id]);
        return rows[0];
    }

    static async findAll() {
        const [rows] = await pool.query('SELECT * FROM employee');
        return rows;
    }

    static async update(id, { full_name, civil_status, birth_date, entry_date, seniority, contract_type, job_title, fonction, sub_type_id, type_description }) {
        await pool.query(
            'UPDATE employee SET full_name = ?, civil_status = ?, birth_date = ?, entry_date = ?, seniority = ?, contract_type = ?, job_title = ?, fonction = ?, sub_type_id = ?, type_description = ? WHERE id = ?',
            [full_name, civil_status, birth_date, entry_date, seniority, contract_type, job_title, fonction, sub_type_id, type_description, id]
        );
        return this.findById(id);
    }

    static async delete(id) {
        await pool.query('DELETE FROM employee WHERE id = ?', [id]);
    }
}

module.exports = Employee;