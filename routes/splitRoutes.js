const express = require('express');
const router = express.Router();
const splitController = require('../controllers/splitController');

// Split routes — static paths must be registered before `/:code` or they match as a code
router.get('/', splitController.getAllSplits);
router.get('/by-site/:site_id', splitController.findBySiteId);
router.get('/lookup', splitController.getSplitLocationByCode);
router.get('/:code', splitController.getSplitById);
router.post('/', splitController.createSplit);
router.put('/:code', splitController.updateSplit);
router.delete('/:code', splitController.deleteSplit);

module.exports = router;