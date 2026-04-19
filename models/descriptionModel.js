const { safeQuery } = require('../utils/databaseUtils');

class Description {
    static async create({ content }) {
        const result = await safeQuery(
            'INSERT INTO comments (content) VALUES (?)',
            [content]
        );
        return this.findById(result.insertId);
    }

    static async findAll() {
        const rows = await safeQuery('SELECT * FROM comments ORDER BY id DESC');
        return rows;
    }

    static async findById(id) {
        const rows = await safeQuery('SELECT * FROM comments WHERE id = ?', [id]);
        return rows[0];
    }

    static async update(id, { content }) {
        await safeQuery('UPDATE comments SET content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [content, id]);
        return this.findById(id);
    }

    static async delete(id) {
        await safeQuery('DELETE FROM comments WHERE id = ?', [id]);
    }
}

module.exports = Description;