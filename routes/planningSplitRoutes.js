const express = require('express');
const router = express.Router();
const planningSplitController = require('../controllers/planningSplitController');

// Planning Splits routes
router.get('/', planningSplitController.getAllPlanningSplits);
router.get('/stats', planningSplitController.getPlanningSplitStats);
router.get('/by-status/:status', planningSplitController.getPlanningSplitsByStatus);
router.get('/planning-site/:planningSiteId', planningSplitController.getPlanningSplitsByPlanningSiteId);
router.get('/:id', planningSplitController.getPlanningSplitById);
router.post('/', planningSplitController.createPlanningSplit);
router.post('/batch', planningSplitController.createPlanningSplitsBatch);
router.put('/:id', planningSplitController.updatePlanningSplit);
router.delete('/:id', planningSplitController.deletePlanningSplit);
router.delete('/planning-site/:planningSiteId/cascade', planningSplitController.deletePlanningSplitsByPlanningSiteId);

module.exports = router;
