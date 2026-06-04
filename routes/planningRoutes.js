const express = require('express');
const router = express.Router();
const planningController = require('../controllers/planningController');

// Planning routes
router.get('/', planningController.getAllPlanning);
router.get('/by-status/:status', planningController.getPlanningByStatus);
router.get('/client/:clientId', planningController.getPlanningByClientId);
router.get('/:id', planningController.getPlanningById);
router.post('/', planningController.createPlanning);
router.put('/:id', planningController.updatePlanning);
router.delete('/:id', planningController.deletePlanning);

module.exports = router;
