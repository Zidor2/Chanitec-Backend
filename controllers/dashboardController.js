const { safeQuery } = require('../utils/databaseUtils');

// Get dashboard summary - combines quotes, clients, and splits counts
const getDashboardSummary = async (req, res) => {
    try {
        // Fetch all counts in parallel
        const [quotesResult, clientsResult, splitsResult] = await Promise.all([
            safeQuery('SELECT COUNT(*) as count FROM quotes'),
            safeQuery('SELECT COUNT(*) as count FROM clients'),
            safeQuery('SELECT COUNT(*) as count FROM splits')
        ]);

        const summary = {
            totalQuotes: quotesResult[0].count,
            totalClients: clientsResult[0].count,
            totalSplits: splitsResult[0].count,
            timestamp: new Date().toISOString()
        };

        res.json(summary);
    } catch (error) {
        console.error('Error fetching dashboard summary:', error);
        res.status(500).json({ error: 'Error fetching dashboard summary' });
    }
};

// Get dashboard stats with detailed information
const getDashboardStats = async (req, res) => {
    try {
        // Fetch quotes count and pending quotes
        const quotesResult = await safeQuery('SELECT COUNT(*) as total, SUM(CASE WHEN confirmed = 0 OR confirmed IS NULL THEN 1 ELSE 0 END) as pending FROM quotes');

        const clientsResult = await safeQuery('SELECT COUNT(*) as count FROM clients');
        const splitsResult = await safeQuery('SELECT COUNT(*) as count FROM splits');

        const stats = {
            totalQuotes: quotesResult[0].total,
            pendingQuotes: quotesResult[0].pending || 0,
            totalClients: clientsResult[0].count,
            totalSplits: splitsResult[0].count,
            timestamp: new Date().toISOString()
        };

        res.json(stats);
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ error: 'Error fetching dashboard stats' });
    }
};

module.exports = {
    getDashboardSummary,
    getDashboardStats
};
