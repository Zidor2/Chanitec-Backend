const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

// Dashboard routes
router.get('/summary', dashboardController.getDashboardSummary);
router.get('/stats', dashboardController.getDashboardStats);

module.exports = router;
