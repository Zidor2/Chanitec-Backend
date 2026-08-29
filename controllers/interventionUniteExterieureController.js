const InterventionUniteExterieure = require('../models/interventionUniteExterieureModel');

const getUniteExterieureByInterventionId = async (req, res) => {
    try {
        const row = await InterventionUniteExterieure.findByInterventionId(req.params.interventionId);
        if (!row) {
            return res.status(404).json({ error: 'Unité extérieure not found for this intervention' });
        }
        res.json(row);
    } catch (error) {
        console.error('Error fetching intervention unité extérieure:', error);
        res.status(500).json({ error: 'Error fetching intervention unité extérieure' });
    }
};

const getUniteExterieureById = async (req, res) => {
    try {
        const row = await InterventionUniteExterieure.findById(req.params.id);
        if (!row) {
            return res.status(404).json({ error: 'Unité extérieure not found' });
        }
        res.json(row);
    } catch (error) {
        console.error('Error fetching intervention unité extérieure by id:', error);
        res.status(500).json({ error: 'Error fetching intervention unité extérieure' });
    }
};

const createUniteExterieure = async (req, res) => {
    try {
        const {
            absence_echauffement,
            absence_vibration,
            serrage_connexions_electriques,
            depoussierage_cablage_electrique,
            nettoyage_condenseur_eau_produit_detergent,
            verification_unite_exterieure,
            verification_fonctionnement_variateur_vitesse
        } = req.body;

        const intervention_id = req.params.interventionId;

        if (!intervention_id) {
            return res.status(400).json({ error: 'intervention_id is required' });
        }

        const row = await InterventionUniteExterieure.create({
            intervention_id,
            absence_echauffement,
            absence_vibration,
            serrage_connexions_electriques,
            depoussierage_cablage_electrique,
            nettoyage_condenseur_eau_produit_detergent,
            verification_unite_exterieure,
            verification_fonctionnement_variateur_vitesse
        });

        res.status(201).json(row);
    } catch (error) {
        console.error('Error creating intervention unité extérieure:', error);
        res.status(500).json({ error: 'Error creating intervention unité extérieure' });
    }
};

const updateUniteExterieure = async (req, res) => {
    try {
        const row = await InterventionUniteExterieure.findById(req.params.id);
        if (!row) {
            return res.status(404).json({ error: 'Unité extérieure not found' });
        }

        const updated = await InterventionUniteExterieure.update(req.params.id, req.body);
        res.json(updated);
    } catch (error) {
        console.error('Error updating intervention unité extérieure:', error);
        res.status(500).json({ error: 'Error updating intervention unité extérieure' });
    }
};

const deleteUniteExterieure = async (req, res) => {
    try {
        const deleted = await InterventionUniteExterieure.delete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ error: 'Unité extérieure not found' });
        }
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting intervention unité extérieure:', error);
        res.status(500).json({ error: 'Error deleting intervention unité extérieure' });
    }
};

module.exports = {
    getUniteExterieureByInterventionId,
    getUniteExterieureById,
    createUniteExterieure,
    updateUniteExterieure,
    deleteUniteExterieure
};
