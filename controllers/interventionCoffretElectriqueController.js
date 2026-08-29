const InterventionCoffretElectrique = require('../models/interventionCoffretElectriqueModel');

const getCoffretElectriqueByInterventionId = async (req, res) => {
    try {
        const row = await InterventionCoffretElectrique.findByInterventionId(req.params.interventionId);
        if (!row) {
            return res.status(404).json({ error: 'Coffret électrique/commande/puissance not found for this intervention' });
        }
        res.json(row);
    } catch (error) {
        console.error('Error fetching coffret électrique/commande/puissance:', error);
        res.status(500).json({ error: 'Error fetching coffret électrique/commande/puissance' });
    }
};

const getCoffretElectriqueById = async (req, res) => {
    try {
        const row = await InterventionCoffretElectrique.findById(req.params.id);
        if (!row) {
            return res.status(404).json({ error: 'Coffret électrique/commande/puissance not found' });
        }
        res.json(row);
    } catch (error) {
        console.error('Error fetching coffret électrique/commande/puissance by id:', error);
        res.status(500).json({ error: 'Error fetching coffret électrique/commande/puissance' });
    }
};

const createCoffretElectrique = async (req, res) => {
    try {
        const {
            nettoyage_depoussierage_coffret_electrique,
            serrage_connexions_electriques,
            etat_fusibles_coffret_puissance,
            etat_voyants_fonctionnement_sirene,
            verification_fonctionnement_minuterie
        } = req.body;

        const intervention_id = req.params.interventionId || req.body?.intervention_id;

        if (!intervention_id) {
            return res.status(400).json({ error: 'intervention_id is required' });
        }

        const row = await InterventionCoffretElectrique.create({
            intervention_id,
            nettoyage_depoussierage_coffret_electrique,
            serrage_connexions_electriques,
            etat_fusibles_coffret_puissance,
            etat_voyants_fonctionnement_sirene,
            verification_fonctionnement_minuterie
        });

        res.status(201).json(row);
    } catch (error) {
        console.error('Error creating coffret électrique/commande/puissance:', error);
        res.status(500).json({ error: 'Error creating coffret électrique/commande/puissance' });
    }
};

const updateCoffretElectrique = async (req, res) => {
    try {
        const row = await InterventionCoffretElectrique.findById(req.params.id);
        if (!row) {
            return res.status(404).json({ error: 'Coffret électrique/commande/puissance not found' });
        }

        const updated = await InterventionCoffretElectrique.update(req.params.id, req.body);
        res.json(updated);
    } catch (error) {
        console.error('Error updating coffret électrique/commande/puissance:', error);
        res.status(500).json({ error: 'Error updating coffret électrique/commande/puissance' });
    }
};

const deleteCoffretElectrique = async (req, res) => {
    try {
        const deleted = await InterventionCoffretElectrique.delete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ error: 'Coffret électrique/commande/puissance not found' });
        }
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting coffret électrique/commande/puissance:', error);
        res.status(500).json({ error: 'Error deleting coffret électrique/commande/puissance' });
    }
};

module.exports = {
    getCoffretElectriqueByInterventionId,
    getCoffretElectriqueById,
    createCoffretElectrique,
    updateCoffretElectrique,
    deleteCoffretElectrique
};
