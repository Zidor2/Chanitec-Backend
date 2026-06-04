const express = require('express');
const router = express.Router();
const planningSiteController = require('../controllers/planningSiteController');

// Planning Sites routes
router.get('/', planningSiteController.getAllPlanningSites);
router.get('/by-status/:status', planningSiteController.getPlanningSitesByStatus);
router.get('/planning/:planningId', planningSiteController.getPlanningSitesByPlanningId);
router.get('/site/:siteId', planningSiteController.getPlanningSitesBySiteId);
router.get('/:id', planningSiteController.getPlanningSiteById);
router.post('/', planningSiteController.createPlanningSite);
router.post('/batch', planningSiteController.createPlanningSitesBatch);
router.put('/:id', planningSiteController.updatePlanningSite);
router.delete('/:id', planningSiteController.deletePlanningSite);
router.delete('/planning/:planningId/cascade', planningSiteController.deletePlanningSitesByPlanningId);

module.exports = router;
