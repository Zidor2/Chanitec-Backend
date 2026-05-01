const express = require('express');
const router = express.Router();
const splitController = require('../controllers/splitController');

// Split routes — static paths must be registered before `/:id` or they match as an id
router.get('/', splitController.getAllSplits);
router.get('/by-site/:site_id', splitController.findBySiteId);
router.get('/lookup', splitController.getSplitLocationByCode);
router.get('/:id', splitController.getSplitById);
router.post('/', splitController.createSplit);
router.put('/:id', splitController.updateSplit);
router.delete('/:id', splitController.deleteSplit);

module.exports = router;