const express = require('express');
const router = express.Router();
const interventionMesureReleveController = require('../controllers/interventionMesureReleveController');

router.get('/by-intervention/:interventionId', interventionMesureReleveController.getMesureReleveByInterventionId);
router.get('/:id', interventionMesureReleveController.getMesureReleveById);
router.post('/:interventionId', interventionMesureReleveController.createMesureReleve);
router.put('/:id', interventionMesureReleveController.updateMesureReleve);
router.delete('/:id', interventionMesureReleveController.deleteMesureReleve);

module.exports = router;
