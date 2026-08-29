const { logRequest } = require('../utils/activityLogger');

const activityLog = (req, res, next) => {
    res.on('finish', () => {
        logRequest(req, res);
    });
    next();
};

module.exports = activityLog;
