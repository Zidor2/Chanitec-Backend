const express = require('express');
const router = express.Router();
const interventionLiaisonsElectriquesController = require('../controllers/interventionLiaisonsElectriquesController');

router.get('/by-intervention/:interventionId', interventionLiaisonsElectriquesController.getLiaisonsElectriquesByInterventionId);
router.get('/:id', interventionLiaisonsElectriquesController.getLiaisonsElectriquesById);
router.post('/:interventionId', interventionLiaisonsElectriquesController.createLiaisonsElectriques);
router.put('/:id', interventionLiaisonsElectriquesController.updateLiaisonsElectriques);
router.delete('/:id', interventionLiaisonsElectriquesController.deleteLiaisonsElectriques);

module.exports = router;
