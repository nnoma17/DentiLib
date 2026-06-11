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

const router = express.Router();

router.post('/admin/gestionWorksheet/create_worksheet', authMiddleware, createWorksheet);
router.get('/admin/gestionWorksheet/get_all_worksheet', authMiddleware, getAllWorksheets);
router.get('/admin/gestionWorksheet/get_all_worksheet_by_dentiste', authMiddleware, getAllWorksheetsByDentist);
router.get('/admin/get_worksheet_by_id/:worksheetId', authMiddleware, getWorksheetById);
router.delete('/admin/gestionWorksheet/delete_worksheet/:worksheetId', authMiddleware, deleteWorksheet);
router.put('/admin/gestionWorksheet/update_worksheet/:worksheetId', authMiddleware, updateWorksheet);
router.put('/admin/gestionWorksheet/update_status/:worksheetId', authMiddleware, updateStatus);
router.get('/dentiste/getAssociatedProthesist', authMiddleware, getAssociatedProthesist);

module.exports = router;