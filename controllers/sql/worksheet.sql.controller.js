// controllers/sql/worksheet.sql.controller.js
// ============================================================
//  DentiLib — Controller SQL WorkSheet
//  CP3 — Composants métier back-end
//      ✅ Style défensif (try/catch, validation, codes HTTP)
//      ✅ Séparation controller / service (pas de SQL ici)
//  CP8 — Accès aux données (via worksheet.sql.service.js)
//  ⚠️  N'importe AUCUN modèle Mongoose — 100% SQL
// ============================================================

const worksheetSQLService = require('../../services/sql/worksheet.sql.service');

// ============================================================
//  POST /api/sql/worksheets
//  Créer une fiche de travail
// ============================================================
const createWorksheet = async (req, res) => {
    try {
        const {
            numWorkSheet,
            comment,
            procedureId,
            firstNamePatient,
            lastNamePatient,
            emailPatient,
            numSecuPatient,
            invoicePDF
        } = req.body;

        // L'ID du dentiste vient du token JWT (middleware auth)
        const idDentist = req.user?.sqlId || req.user?.id;

        const worksheet = await worksheetSQLService.createWorksheet({
            numWorkSheet,
            comment,
            procedureId,
            firstNamePatient,
            lastNamePatient,
            emailPatient,
            numSecuPatient,
            invoicePDF,
            idDentist
        });

        return res.status(201).json({
            success: true,
            message: 'Worksheet créée avec succès (SQL)',
            worksheet
        });

    } catch (error) {
        console.error('[SQL] createWorksheet :', error.message);

        // Erreur de validation métier → 400
        if (error.message.includes('manquants') || error.message.includes('invalide')) {
            return res.status(400).json({ success: false, message: error.message });
        }

        // Doublon (num_worksheet UNIQUE) → 409
        if (error.code === '23505') {
            return res.status(409).json({ success: false, message: 'Numéro de worksheet déjà utilisé' });
        }

        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la création de la worksheet',
            error: error.message
        });
    }
};

// ============================================================
//  GET /api/sql/worksheets
//  Toutes les fiches (admin)
// ============================================================
const getAllWorksheets = async (req, res) => {
    try {
        const worksheets = await worksheetSQLService.getAllWorksheets();

        return res.status(200).json({
            success: true,
            count: worksheets.length,
            worksheets
        });

    } catch (error) {
        console.error('[SQL] getAllWorksheets :', error.message);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des worksheets',
            error: error.message
        });
    }
};

// ============================================================
//  GET /api/sql/worksheets/dentiste
//  Fiches du dentiste connecté
// ============================================================
const getAllWorksheetsByDentist = async (req, res) => {
    try {
        const dentistId = req.user?.sqlId || req.user?.id;

        const worksheets = await worksheetSQLService.getWorksheetsByDentist(dentistId);

        return res.status(200).json({
            success: true,
            count: worksheets.length,
            worksheets
        });

    } catch (error) {
        console.error('[SQL] getAllWorksheetsByDentist :', error.message);

        if (error.message.includes('invalide')) {
            return res.status(400).json({ success: false, message: error.message });
        }

        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des worksheets du dentiste',
            error: error.message
        });
    }
};

// ============================================================
//  GET /api/sql/worksheets/:worksheetId
//  Fiche par ID
// ============================================================
const getWorksheetById = async (req, res) => {
    try {
        const { worksheetId } = req.params;
        const worksheet = await worksheetSQLService.getWorksheetById(worksheetId);

        if (!worksheet) {
            return res.status(404).json({ success: false, message: 'Worksheet non trouvée' });
        }

        return res.status(200).json({ success: true, worksheet });

    } catch (error) {
        console.error('[SQL] getWorksheetById :', error.message);

        if (error.message.includes('invalide')) {
            return res.status(400).json({ success: false, message: error.message });
        }

        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération de la worksheet',
            error: error.message
        });
    }
};

// ============================================================
//  PUT /api/sql/worksheets/:worksheetId/status
//  Modifier le statut
// ============================================================
const updateStatus = async (req, res) => {
    try {
        const { worksheetId } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ success: false, message: 'Le statut est requis' });
        }

        const worksheet = await worksheetSQLService.updateStatus(worksheetId, status);

        return res.status(200).json({
            success: true,
            message: `Statut mis à jour en "${status}"`,
            worksheet
        });

    } catch (error) {
        console.error('[SQL] updateStatus :', error.message);

        if (error.message.includes('invalide') || error.message.includes('Statut')) {
            return res.status(400).json({ success: false, message: error.message });
        }

        if (error.message === 'Worksheet non trouvée') {
            return res.status(404).json({ success: false, message: error.message });
        }

        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la mise à jour du statut',
            error: error.message
        });
    }
};

// ============================================================
//  PUT /api/sql/worksheets/:worksheetId
//  Modifier une fiche
// ============================================================
const updateWorksheet = async (req, res) => {
    try {
        const { worksheetId } = req.params;
        const worksheet = await worksheetSQLService.updateWorksheet(worksheetId, req.body);

        return res.status(200).json({
            success: true,
            message: 'Worksheet mise à jour',
            worksheet
        });

    } catch (error) {
        console.error('[SQL] updateWorksheet :', error.message);

        if (error.message.includes('invalide')) {
            return res.status(400).json({ success: false, message: error.message });
        }

        if (error.message === 'Worksheet non trouvée') {
            return res.status(404).json({ success: false, message: error.message });
        }

        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la mise à jour',
            error: error.message
        });
    }
};

// ============================================================
//  DELETE /api/sql/worksheets/:worksheetId
//  Supprimer une fiche
// ============================================================
const deleteWorksheet = async (req, res) => {
    try {
        const { worksheetId } = req.params;
        const worksheet = await worksheetSQLService.deleteWorksheet(worksheetId);

        return res.status(200).json({
            success: true,
            message: 'Worksheet supprimée',
            worksheet
        });

    } catch (error) {
        console.error('[SQL] deleteWorksheet :', error.message);

        if (error.message === 'Worksheet non trouvée') {
            return res.status(404).json({ success: false, message: error.message });
        }

        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la suppression',
            error: error.message
        });
    }
};

// ============================================================
//  POST /api/sql/worksheets/with-status  [démo transaction CP8]
//  Créer une fiche avec statut initial — opération atomique
// ============================================================
const createWorksheetWithStatus = async (req, res) => {
    try {
        const { initialStatus, ...worksheetData } = req.body;
        worksheetData.idDentist = req.user?.sqlId || req.user?.id;

        const worksheet = await worksheetSQLService.createWorksheetWithStatus(
            worksheetData,
            initialStatus
        );

        return res.status(201).json({
            success: true,
            message: 'Worksheet créée avec statut (transaction SQL)',
            worksheet
        });

    } catch (error) {
        console.error('[SQL] createWorksheetWithStatus :', error.message);

        if (error.message.includes('invalide') || error.message.includes('manquants')) {
            return res.status(400).json({ success: false, message: error.message });
        }

        return res.status(500).json({
            success: false,
            message: 'Erreur transaction SQL',
            error: error.message
        });
    }
};

module.exports = {
    createWorksheet,
    getAllWorksheets,
    getAllWorksheetsByDentist,
    getWorksheetById,
    updateStatus,
    updateWorksheet,
    deleteWorksheet,
    createWorksheetWithStatus
};