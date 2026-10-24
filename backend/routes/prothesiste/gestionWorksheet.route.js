const express = require("express");
const {
  getAllWorksheets,
  getWorksheetById,
  getAssociatedDentist,
  updateWorksheetStatus
} = require("../../controllers/prothesiste/gestionWorksheet.controller");
const authMiddleware = require("../../middleware/authMiddleware");
const { requireRole } = require("../../middleware/authMiddleware");

const router = express.Router();

router.get('/prothesiste/gestionWorksheet/get_all_worksheets', authMiddleware, requireRole("PROTHESISTE"), getAllWorksheets);
router.get('/prothesiste/get_worksheet_by_id/:worksheetId', authMiddleware, requireRole("PROTHESISTE"), getWorksheetById);
router.get("/prothesiste/getAssociatedDentist", authMiddleware, requireRole("PROTHESISTE"), getAssociatedDentist);

router.put('/prothesiste/gestionWorksheet/update_status/:worksheetId', authMiddleware, requireRole("PROTHESISTE"), updateWorksheetStatus);

module.exports = router;