const express = require('express');
const router = express.Router();
const interventionUniteExterieureController = require('../controllers/interventionUniteExterieureController');

router.get('/by-intervention/:interventionId', interventionUniteExterieureController.getUniteExterieureByInterventionId);
router.get('/:id', interventionUniteExterieureController.getUniteExterieureById);
router.post('/:interventionId', interventionUniteExterieureController.createUniteExterieure);
router.put('/:id', interventionUniteExterieureController.updateUniteExterieure);
router.delete('/:id', interventionUniteExterieureController.deleteUniteExterieure);

module.exports = router;
