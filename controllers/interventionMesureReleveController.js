const InterventionMesureReleve = require('../models/interventionMesureReleveModel');

const getMesureReleveByInterventionId = async (req, res) => {
    try {
        const row = await InterventionMesureReleve.findByInterventionId(req.params.interventionId);
        if (!row) {
            return res.status(404).json({ error: 'Mesure et relevé not found for this intervention' });
        }
        res.json(row);
    } catch (error) {
        console.error('Error fetching mesure et relevé:', error);
        res.status(500).json({ error: 'Error fetching mesure et relevé' });
    }
};

const getMesureReleveById = async (req, res) => {
    try {
        const row = await InterventionMesureReleve.findById(req.params.id);
        if (!row) {
            return res.status(404).json({ error: 'Mesure et relevé not found' });
        }
        res.json(row);
    } catch (error) {
        console.error('Error fetching mesure et relevé by id:', error);
        res.status(500).json({ error: 'Error fetching mesure et relevé' });
    }
};

const createMesureReleve = async (req, res) => {
    try {
        const {
            split_id,
            split_code,
            clim_number,
            general_voltage,
            general_current,
            compressor_current,
            condenser_fan_current,
            evaporator_fan_current,
            high_pressure,
            low_pressure,
            supply_air_temp,
            room_temp,
            supply_air_flow
        } = req.body;

        const intervention_id = req.params.interventionId || req.body?.intervention_id;

        if (!intervention_id) {
            return res.status(400).json({ error: 'intervention_id is required' });
        }

        const row = await InterventionMesureReleve.create({
            intervention_id,
            split_id,
            split_code,
            clim_number,
            general_voltage,
            general_current,
            compressor_current,
            condenser_fan_current,
            evaporator_fan_current,
            high_pressure,
            low_pressure,
            supply_air_temp,
            room_temp,
            supply_air_flow
        });

        res.status(201).json(row);
    } catch (error) {
        console.error('Error creating mesure et relevé:', error);
        res.status(500).json({ error: 'Error creating mesure et relevé' });
    }
};

const updateMesureReleve = async (req, res) => {
    try {
        const row = await InterventionMesureReleve.findById(req.params.id);
        if (!row) {
            return res.status(404).json({ error: 'Mesure et relevé not found' });
        }

        const updated = await InterventionMesureReleve.update(req.params.id, req.body);
        res.json(updated);
    } catch (error) {
        console.error('Error updating mesure et relevé:', error);
        res.status(500).json({ error: 'Error updating mesure et relevé' });
    }
};

const deleteMesureReleve = async (req, res) => {
    try {
        const deleted = await InterventionMesureReleve.delete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ error: 'Mesure et relevé not found' });
        }
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting mesure et relevé:', error);
        res.status(500).json({ error: 'Error deleting mesure et relevé' });
    }
};

module.exports = {
    getMesureReleveByInterventionId,
    getMesureReleveById,
    createMesureReleve,
    updateMesureReleve,
    deleteMesureReleve
};
