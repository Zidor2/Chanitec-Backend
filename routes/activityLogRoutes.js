const express = require('express');
const router = express.Router();
const activityLogController = require('../controllers/activityLogController');
const { authenticate } = require('../middleware/auth');
const { canSeeLogs } = require('../utils/userPermissions');

const authorizeLogs = (req, res, next) => {
    if (!canSeeLogs(req.user)) {
        return res.status(403).json({
            error: 'Access Denied',
            message: 'You do not have access to activity logs'
        });
    }
    next();
};

router.use(authenticate);
router.use(authorizeLogs);

router.get('/', activityLogController.getActivityLogs);
router.get('/actions', activityLogController.getActivityLogActions);

module.exports = router;
