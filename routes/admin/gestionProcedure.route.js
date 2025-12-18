const express = require("express");
const {
    createProcedure,
    deleteProcedure,
    updateProcedure,
    getAllProcedures
} = require("../../controllers/admin/gestionProcedure.controller");
const authMiddleware = require("../../middleware/authMiddleware");

const router = express.Router();
router.post('/admin/gestionProcedure/create_Procedure', authMiddleware, createProcedure);
router.get('/admin/gestionProcedure/get_All_Procedures', authMiddleware, getAllProcedures);
router.put('/admin/gestionProcedure/update_Procedure/:procedureId', authMiddleware, updateProcedure);
router.delete("/admin/gestionProcedure/delete_Procedure/:procedureId",authMiddleware, deleteProcedure);

module.exports = router;