const express = require("express");
const {
    createWorksheet,
    deleteWorksheet,
    updateWorksheet,
    modifyWorksheet,
    getAllWorksheets
} = require("../../controllers/admin/gestionWorksheet.controller");
const authMiddleware = require("../../middleware/authMiddleware");

const router = express.Router();
router.post('/admin/gestionWorksheet/create_worksheet', authMiddleware, createWorksheet);
router.get('/admin/gestionWorksheet/get_all_worksheet', authMiddleware, getAllWorksheets);
router.get('/admin/get_worksheet_by_id/:worksheetId', authMiddleware, getWorksheetById);
router.delete("/admin/gestionWorksheet/delete_worksheet/:worksheetId",authMiddleware, deleteWorksheet);

module.exports = router;