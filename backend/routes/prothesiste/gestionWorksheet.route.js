const express = require("express");
const {
  getAllWorksheets,
  getWorksheetById,
  getAssociatedDentist,
  updateWorksheetStatus
} = require("../../controllers/prothesiste/gestionWorksheet.controller");
const authMiddleware = require("../../middleware/authMiddleware");

const router = express.Router();

// Récupérer toutes les worksheets associées au prothésiste (hors "A valider")
router.get('/prothesiste/gestionWorksheet/get_all_worksheets', authMiddleware, getAllWorksheets);
router.get('/prothesiste/get_worksheet_by_id/:worksheetId', authMiddleware, getWorksheetById);
router.get("/prothesiste/getAssociatedDentist", authMiddleware, getAssociatedDentist);

router.put('/prothesiste/gestionWorksheet/update_status/:worksheetId', authMiddleware, updateWorksheetStatus);

module.exports = router;