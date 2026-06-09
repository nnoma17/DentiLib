// routes/sql/worksheet.sql.route.js
// ============================================================
//  DentiLib — Routes SQL WorkSheet
//  Préfixe : /api/sql/worksheets
//  ⚠️  Fichier NOUVEAU — n'écrase aucune route existante
//      Les routes MongoDB restent sur /api/admin/gestionWorksheet/...
// ============================================================

const express = require('express');
const router  = express.Router();
const authMiddleware = require('../../middleware/authMiddleware');

const {
    createWorksheet,
    getAllWorksheets,
    getAllWorksheetsByDentist,
    getWorksheetById,
    updateStatus,
    updateWorksheet,
    deleteWorksheet,
    createWorksheetWithStatus
} = require('../../controllers/sql/worksheet.sql.controller');

// Toutes les routes nécessitent un token JWT valide
router.use(authMiddleware);

router.post  ('/',                   createWorksheet);
router.post  ('/with-status',        createWorksheetWithStatus);    // démo transaction CP8
router.get   ('/',                   getAllWorksheets);
router.get   ('/dentiste',           getAllWorksheetsByDentist);
router.get   ('/:worksheetId',       getWorksheetById);
router.put   ('/:worksheetId',       updateWorksheet);
router.put   ('/:worksheetId/status', updateStatus);
router.delete('/:worksheetId',       deleteWorksheet);

module.exports = router;