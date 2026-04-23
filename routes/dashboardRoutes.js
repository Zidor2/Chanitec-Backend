const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// Dashboard routes
router.get('/summary', dashboardController.getDashboardSummary);
router.get('/stats', dashboardController.getDashboardStats);

module.exports = router;
