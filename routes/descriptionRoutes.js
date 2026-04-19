const express = require('express');
const router = express.Router();
const descriptionController = require('../controllers/descriptionController');

// Description routes
router.get('/', descriptionController.getAllDescriptions);
router.post('/', descriptionController.createDescription);

module.exports = router;