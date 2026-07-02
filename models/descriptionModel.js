const { safeQuery } = require('../utils/databaseUtils');

class Description {
    static async create({ content, section = 1 }) {
        const normalizedSection = Number(section) === 2 ? 2 : 1;
        const result = await safeQuery(
            'INSERT INTO comments (content, section) VALUES (?, ?)',
            [content, normalizedSection]
        );
        return this.findById(result.insertId);
    }

    static async findAll(section) {
        if (section === undefined || section === null || section === '') {
            const rows = await safeQuery('SELECT * FROM comments ORDER BY id DESC');
            return rows;
        }

        const normalizedSection = Number(section) === 2 ? 2 : 1;
        const rows = await safeQuery('SELECT * FROM comments WHERE section = ? ORDER BY id DESC', [normalizedSection]);
        return rows;
    }

    static async findById(id) {
        const rows = await safeQuery('SELECT * FROM comments WHERE id = ?', [id]);
        return rows[0];
    }

    static async findBySection(section) {
        return this.findAll(section);
    }

    static async update(id, { content, section }) {
        const normalizedSection = section === undefined ? undefined : (Number(section) === 2 ? 2 : 1);

        if (content !== undefined && normalizedSection === undefined) {
            await safeQuery('UPDATE comments SET content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [content, id]);
        } else if (content === undefined && normalizedSection !== undefined) {
            await safeQuery('UPDATE comments SET section = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [normalizedSection, id]);
        } else if (content !== undefined && normalizedSection !== undefined) {
            await safeQuery('UPDATE comments SET content = ?, section = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [content, normalizedSection, id]);
        }

        return this.findById(id);
    }

    static async delete(id) {
        await safeQuery('DELETE FROM comments WHERE id = ?', [id]);
    }
}

module.exports = Description;