const express = require('express');
const router = express.Router();
const descriptionController = require('../controllers/descriptionController');

// Description routes
router.get('/', descriptionController.getAllDescriptions);
router.post('/', descriptionController.createDescription);
router.put('/:id', descriptionController.updateDescription);
router.delete('/:id', descriptionController.deleteDescription);

module.exports = router;