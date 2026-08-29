const InterventionObservations = require('../models/interventionObservationsModel');
const { persistTechnicianScores } = require('../utils/technicianScore');

const getObservationsByInterventionId = async (req, res) => {
    try {
        const row = await InterventionObservations.findByInterventionId(req.params.interventionId);
        if (!row) {
            return res.status(404).json({ error: 'Observations not found for this intervention' });
        }
        res.json(row);
    } catch (error) {
        console.error('Error fetching intervention observations:', error);
        res.status(500).json({ error: 'Error fetching intervention observations' });
    }
};

const getObservationsById = async (req, res) => {
    try {
        const row = await InterventionObservations.findById(req.params.id);
        if (!row) {
            return res.status(404).json({ error: 'Observations not found' });
        }
        res.json(row);
    } catch (error) {
        console.error('Error fetching intervention observations by id:', error);
        res.status(500).json({ error: 'Error fetching intervention observations' });
    }
};

const saveObservations = async (req, res) => {
    try {
        const intervention_id = req.params.interventionId || req.body?.intervention_id;
        if (!intervention_id) {
            return res.status(400).json({ error: 'intervention_id is required' });
        }

        const row = await InterventionObservations.upsertByInterventionId(intervention_id, {
            observations_client: req.body?.observations_client ?? '',
            observations_chanic: req.body?.observations_chanic ?? '',
            signature_client: req.body?.signature_client ?? '',
            signature_chanic: req.body?.signature_chanic ?? '',
            technician_employee_ids: req.body?.technician_employee_ids ?? null
        });

        try {
            await persistTechnicianScores();
        } catch (error) {
            console.error('Error updating technician scores:', error);
        }

        res.json(row);
    } catch (error) {
        console.error('Error saving intervention observations:', error);
        res.status(500).json({ error: 'Error saving intervention observations' });
    }
};

const updateObservations = async (req, res) => {
    try {
        const row = await InterventionObservations.findById(req.params.id);
        if (!row) {
            return res.status(404).json({ error: 'Observations not found' });
        }

        const updated = await InterventionObservations.update(req.params.id, req.body);
        try {
            await persistTechnicianScores();
        } catch (error) {
            console.error('Error updating technician scores:', error);
        }
        res.json(updated);
    } catch (error) {
        console.error('Error updating intervention observations:', error);
        res.status(500).json({ error: 'Error updating intervention observations' });
    }
};

const deleteObservations = async (req, res) => {
    try {
        const deleted = await InterventionObservations.delete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ error: 'Observations not found' });
        }
        try {
            await persistTechnicianScores();
        } catch (error) {
            console.error('Error updating technician scores:', error);
        }
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting intervention observations:', error);
        res.status(500).json({ error: 'Error deleting intervention observations' });
    }
};

module.exports = {
    getObservationsByInterventionId,
    getObservationsById,
    saveObservations,
    updateObservations,
    deleteObservations
};
