const Intervention = require('../models/interventionModel');

const getAllInterventions = async (req, res) => {
    try {
        const rows = await Intervention.findAll({
            quote_id: req.query.quote_id,
            client_id: req.query.client_id,
            site_id: req.query.site_id,
            dateFrom: req.query.dateFrom,
            dateTo: req.query.dateTo,
            object: req.query.object,
            split_id: req.query.split_id
        });
        res.json(rows);
    } catch (error) {
        console.error('Error fetching interventions:', {
            message: error.message,
            code: error.code,
            stack: error.stack
        });
        res.status(500).json({ error: 'Error fetching interventions' });
    }
};

const getInterventionById = async (req, res) => {
    try {
        const row = await Intervention.findById(req.params.id);
        if (!row) {
            return res.status(404).json({ error: 'Intervention not found' });
        }
        res.json(row);
    } catch (error) {
        console.error('Error fetching intervention:', error);
        res.status(500).json({ error: 'Error fetching intervention' });
    }
};

const createIntervention = async (req, res) => {
    const {
        quote_id,
        client_id,
        intervention_date,
        heure_arrive,
        heure_depart,
        site_id,
        object,
        raison
    } = req.body;

    if (!intervention_date) {
        return res.status(400).json({ error: 'intervention_date is required' });
    }

    try {
        const intervention = await Intervention.create({
            quote_id,
            client_id,
            intervention_date,
            heure_arrive,
            heure_depart,
            site_id,
            object,
            raison
        });
        res.status(201).json(intervention);
    } catch (error) {
        console.error('Error creating intervention:', error);
        res.status(500).json({
            error: 'Error creating intervention',
            details: error.message
        });
    }
};

const updateIntervention = async (req, res) => {
    try {
        const existing = await Intervention.findById(req.params.id);
        if (!existing) {
            return res.status(404).json({ error: 'Intervention not found' });
        }

        if (req.body.intervention_date === '') {
            return res.status(400).json({ error: 'intervention_date is required' });
        }

        const intervention = await Intervention.update(req.params.id, req.body);
        res.json(intervention);
    } catch (error) {
        console.error('Error updating intervention:', error);
        res.status(500).json({
            error: 'Error updating intervention',
            details: error.message
        });
    }
};

const deleteIntervention = async (req, res) => {
    try {
        const deleted = await Intervention.delete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ error: 'Intervention not found' });
        }
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting intervention:', error);
        res.status(500).json({ error: 'Error deleting intervention' });
    }
};

module.exports = {
    getAllInterventions,
    getInterventionById,
    createIntervention,
    updateIntervention,
    deleteIntervention
};
