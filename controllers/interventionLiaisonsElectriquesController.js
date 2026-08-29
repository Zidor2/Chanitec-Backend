const InterventionLiaisonsElectriques = require('../models/interventionLiaisonsElectriquesModel');

const getLiaisonsElectriquesByInterventionId = async (req, res) => {
    try {
        const row = await InterventionLiaisonsElectriques.findByInterventionId(req.params.interventionId);
        if (!row) {
            return res.status(404).json({ error: 'Liaisons électriques/frigorifiques not found for this intervention' });
        }
        res.json(row);
    } catch (error) {
        console.error('Error fetching liaisons électriques/frigorifiques:', error);
        res.status(500).json({ error: 'Error fetching liaisons électriques/frigorifiques' });
    }
};

const getLiaisonsElectriquesById = async (req, res) => {
    try {
        const row = await InterventionLiaisonsElectriques.findById(req.params.id);
        if (!row) {
            return res.status(404).json({ error: 'Liaisons électriques/frigorifiques not found' });
        }
        res.json(row);
    } catch (error) {
        console.error('Error fetching liaisons électriques/frigorifiques by id:', error);
        res.status(500).json({ error: 'Error fetching liaisons électriques/frigorifiques' });
    }
};

const createLiaisonsElectriques = async (req, res) => {
    try {
        const {
            verification_fixation_circuits_frigorifiques,
            verification_calorifuge_circuits_frigorifiques,
            verification_fixation_circuits_electriques
        } = req.body;

        const intervention_id = req.params.interventionId || req.body?.intervention_id;

        if (!intervention_id) {
            return res.status(400).json({ error: 'intervention_id is required' });
        }

        const row = await InterventionLiaisonsElectriques.create({
            intervention_id,
            verification_fixation_circuits_frigorifiques,
            verification_calorifuge_circuits_frigorifiques,
            verification_fixation_circuits_electriques
        });

        res.status(201).json(row);
    } catch (error) {
        console.error('Error creating liaisons électriques/frigorifiques:', error);
        res.status(500).json({ error: 'Error creating liaisons électriques/frigorifiques' });
    }
};

const updateLiaisonsElectriques = async (req, res) => {
    try {
        const row = await InterventionLiaisonsElectriques.findById(req.params.id);
        if (!row) {
            return res.status(404).json({ error: 'Liaisons électriques/frigorifiques not found' });
        }

        const updated = await InterventionLiaisonsElectriques.update(req.params.id, req.body);
        res.json(updated);
    } catch (error) {
        console.error('Error updating liaisons électriques/frigorifiques:', error);
        res.status(500).json({ error: 'Error updating liaisons électriques/frigorifiques' });
    }
};

const deleteLiaisonsElectriques = async (req, res) => {
    try {
        const deleted = await InterventionLiaisonsElectriques.delete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ error: 'Liaisons électriques/frigorifiques not found' });
        }
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting liaisons électriques/frigorifiques:', error);
        res.status(500).json({ error: 'Error deleting liaisons électriques/frigorifiques' });
    }
};

module.exports = {
    getLiaisonsElectriquesByInterventionId,
    getLiaisonsElectriquesById,
    createLiaisonsElectriques,
    updateLiaisonsElectriques,
    deleteLiaisonsElectriques
};
