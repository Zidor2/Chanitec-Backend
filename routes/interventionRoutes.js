const express = require('express');
const router = express.Router();
const interventionController = require('../controllers/interventionController');

router.get('/', interventionController.getAllInterventions);
router.get('/:id', interventionController.getInterventionById);
router.post('/', interventionController.createIntervention);
router.put('/:id', interventionController.updateIntervention);
router.delete('/:id', interventionController.deleteIntervention);

module.exports = router;
