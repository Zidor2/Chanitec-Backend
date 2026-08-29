const InterventionEssaisElectrique = require('../models/interventionEssaisElectriqueModel');

const getEssaisElectriqueByInterventionId = async (req, res) => {
    try {
        const row = await InterventionEssaisElectrique.findByInterventionId(req.params.interventionId);
        if (!row) {
            return res.status(404).json({ error: 'Electrical/frigorific tests not found for this intervention' });
        }
        res.json(row);
    } catch (error) {
        console.error('Error fetching electrical/frigorific tests:', error);
        res.status(500).json({ error: 'Error fetching electrical/frigorific tests' });
    }
};

const getEssaisElectriqueById = async (req, res) => {
    try {
        const row = await InterventionEssaisElectrique.findById(req.params.id);
        if (!row) {
            return res.status(404).json({ error: 'Electrical/frigorific tests not found' });
        }
        res.json(row);
    } catch (error) {
        console.error('Error fetching electrical/frigorific tests by id:', error);
        res.status(500).json({ error: 'Error fetching electrical/frigorific tests' });
    }
};

const createEssaisElectrique = async (req, res) => {
    try {
        const {
            essai_securite_bp,
            essai_securite_hp,
            essai_marche_forcee_ht,
            essai_basculement_defaut,
            essai_marche_forcee_cas_ht,
            essai_basculement_cas_defaut
        } = req.body;

        const intervention_id = req.params.interventionId || req.body?.intervention_id;

        if (!intervention_id) {
            return res.status(400).json({ error: 'intervention_id is required' });
        }

        const row = await InterventionEssaisElectrique.create({
            intervention_id,
            essai_securite_bp,
            essai_securite_hp,
            essai_marche_forcee_ht: essai_marche_forcee_cas_ht ?? essai_marche_forcee_ht,
            essai_basculement_defaut: essai_basculement_cas_defaut ?? essai_basculement_defaut
        });

        res.status(201).json(row);
    } catch (error) {
        console.error('Error creating electrical/frigorific tests:', error);
        res.status(500).json({ error: 'Error creating electrical/frigorific tests' });
    }
};

const updateEssaisElectrique = async (req, res) => {
    try {
        const row = await InterventionEssaisElectrique.findById(req.params.id);
        if (!row) {
            return res.status(404).json({ error: 'Electrical/frigorific tests not found' });
        }

        const updated = await InterventionEssaisElectrique.update(req.params.id, req.body);
        res.json(updated);
    } catch (error) {
        console.error('Error updating electrical/frigorific tests:', error);
        res.status(500).json({ error: 'Error updating electrical/frigorific tests' });
    }
};

const deleteEssaisElectrique = async (req, res) => {
    try {
        const deleted = await InterventionEssaisElectrique.delete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ error: 'Electrical/frigorific tests not found' });
        }
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting electrical/frigorific tests:', error);
        res.status(500).json({ error: 'Error deleting electrical/frigorific tests' });
    }
};

module.exports = {
    getEssaisElectriqueByInterventionId,
    getEssaisElectriqueById,
    createEssaisElectrique,
    updateEssaisElectrique,
    deleteEssaisElectrique
};
