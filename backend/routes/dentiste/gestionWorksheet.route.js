const express = require("express");
const {
  createWorksheet,
  getAllWorksheets,
  getAllWorksheetsByDentist,
  getWorksheetById,
  updateWorksheet,
  updateStatus,
  deleteWorksheet,
  getAssociatedProthesist
} = require("../../controllers/dentiste/gestionWorksheet.controller");
const authMiddleware = require("../../middleware/authMiddleware");
const { requireRole } = require("../../middleware/authMiddleware");

const router = express.Router();

router.post('/admin/gestionWorksheet/create_worksheet', authMiddleware, requireRole("DENTISTE"), createWorksheet);
router.get('/admin/gestionWorksheet/get_all_worksheet', authMiddleware, requireRole("ADMIN"), getAllWorksheets);
router.get('/admin/gestionWorksheet/get_all_worksheet_by_dentiste', authMiddleware, requireRole("DENTISTE"), getAllWorksheetsByDentist);
router.get('/admin/get_worksheet_by_id/:worksheetId', authMiddleware, requireRole("DENTISTE"), getWorksheetById);
router.delete('/admin/gestionWorksheet/delete_worksheet/:worksheetId', authMiddleware, requireRole("DENTISTE"), deleteWorksheet);
router.put('/admin/gestionWorksheet/update_worksheet/:worksheetId', authMiddleware, requireRole("DENTISTE"), updateWorksheet);
router.put('/admin/gestionWorksheet/update_status/:worksheetId', authMiddleware, requireRole("DENTISTE"), updateStatus);
router.get('/dentiste/getAssociatedProthesist', authMiddleware, requireRole("DENTISTE"), getAssociatedProthesist);

module.exports = router;