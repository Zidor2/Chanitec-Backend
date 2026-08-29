const express = require('express');
const router = express.Router();
const interventionCoffretElectriqueController = require('../controllers/interventionCoffretElectriqueController');

router.get('/by-intervention/:interventionId', interventionCoffretElectriqueController.getCoffretElectriqueByInterventionId);
router.get('/:id', interventionCoffretElectriqueController.getCoffretElectriqueById);
router.post('/:interventionId', interventionCoffretElectriqueController.createCoffretElectrique);
router.put('/:id', interventionCoffretElectriqueController.updateCoffretElectrique);
router.delete('/:id', interventionCoffretElectriqueController.deleteCoffretElectrique);

module.exports = router;
