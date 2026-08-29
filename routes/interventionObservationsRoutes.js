const express = require('express');
const router = express.Router();
const interventionObservationsController = require('../controllers/interventionObservationsController');

router.get('/by-intervention/:interventionId', interventionObservationsController.getObservationsByInterventionId);
router.get('/:id', interventionObservationsController.getObservationsById);
router.post('/:interventionId', interventionObservationsController.saveObservations);
router.put('/:id', interventionObservationsController.updateObservations);
router.delete('/:id', interventionObservationsController.deleteObservations);

module.exports = router;
