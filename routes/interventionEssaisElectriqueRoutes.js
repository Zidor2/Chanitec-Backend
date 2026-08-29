const express = require('express');
const router = express.Router();
const interventionEssaisElectriqueController = require('../controllers/interventionEssaisElectriqueController');

router.get('/by-intervention/:interventionId', interventionEssaisElectriqueController.getEssaisElectriqueByInterventionId);
router.get('/:id', interventionEssaisElectriqueController.getEssaisElectriqueById);
router.post('/:interventionId', interventionEssaisElectriqueController.createEssaisElectrique);
router.put('/:id', interventionEssaisElectriqueController.updateEssaisElectrique);
router.delete('/:id', interventionEssaisElectriqueController.deleteEssaisElectrique);

module.exports = router;
