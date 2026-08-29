const { safeQuery } = require('../utils/databaseUtils');

const formatLogRow = (row) => {
    let details = row.details;
    if (typeof details === 'string') {
        try {
            details = JSON.parse(details);
        } catch (error) {
            details = { raw: details };
        }
    }
    return {
        id: row.id,
        userId: row.user_id,
        username: row.username,
        action: row.action,
        entityType: row.entity_type,
        entityId: row.entity_id,
        method: row.method,
        path: row.path,
        statusCode: row.status_code,
        details,
        ipAddress: row.ip_address,
        createdAt: row.created_at
    };
};

const getActivityLogs = async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 200);
        const skip = (page - 1) * limit;
        const username = req.query.username;
        const action = req.query.action;
        const entityType = req.query.entityType;
        const dateFrom = req.query.dateFrom;
        const dateTo = req.query.dateTo;
        const status = req.query.status;

        const whereConditions = [];
        const params = [];

        if (username) {
            whereConditions.push('username LIKE ?');
            params.push(`%${username}%`);
        }
        if (action) {
            whereConditions.push('action = ?');
            params.push(action);
        }
        if (entityType) {
            whereConditions.push('entity_type = ?');
            params.push(entityType);
        }
        if (dateFrom) {
            whereConditions.push('created_at >= ?');
            params.push(`${dateFrom} 00:00:00`);
        }
        if (dateTo) {
            whereConditions.push('created_at <= ?');
            params.push(`${dateTo} 23:59:59`);
        }
        if (status === 'success') {
            whereConditions.push('status_code >= 200 AND status_code < 400');
        } else if (status === 'error') {
            whereConditions.push('status_code >= 400');
        }

        const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
        const countRows = await safeQuery(`SELECT COUNT(*) AS total FROM activity_logs ${whereClause}`, params);
        const rows = await safeQuery(
            `SELECT * FROM activity_logs ${whereClause} ORDER BY created_at DESC, id DESC LIMIT ${limit} OFFSET ${skip}`,
            params
        );

        res.json({
            items: rows.map(formatLogRow),
            total: countRows[0].total,
            page,
            limit
        });
    } catch (error) {
        console.error('Error fetching activity logs:', error);
        res.status(500).json({ error: 'Error fetching activity logs' });
    }
};

const getActivityLogActions = async (req, res) => {
    try {
        const rows = await safeQuery(
            'SELECT DISTINCT action FROM activity_logs ORDER BY action ASC'
        );
        res.json(rows.map((row) => row.action));
    } catch (error) {
        console.error('Error fetching activity log actions:', error);
        res.status(500).json({ error: 'Error fetching activity log actions' });
    }
};

module.exports = {
    getActivityLogs,
    getActivityLogActions
};
