const express = require('express');
const router = express.Router();
const splitController = require('../controllers/splitController');

// Split routes
router.get('/', splitController.getAllSplits);
router.get('/:code', splitController.getSplitById);
router.post('/', splitController.createSplit);
router.put('/:code', splitController.updateSplit);
router.delete('/:code', splitController.deleteSplit);
router.get('/:code/site', splitController.getSiteForSplit);

module.exports = router;