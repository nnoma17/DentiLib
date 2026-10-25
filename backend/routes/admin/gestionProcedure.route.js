const express = require("express");
const {
    createProcedure,
    deleteProcedure,
    modifyProcedure,
    getAllProcedures
} = require("../../controllers/admin/gestionProcedure.controller");
const authMiddleware = require("../../middleware/authMiddleware");
const { requireRole } = require("../../middleware/authMiddleware");

const router = express.Router();
router.post('/admin/gestionProcedure/create_Procedure', authMiddleware, requireRole("ADMIN"), createProcedure);
router.put('/admin/gestionProcedure/modify_Procedure/:procedureId', authMiddleware, requireRole("ADMIN"), modifyProcedure);
router.get('/admin/gestionProcedure/get_All_Procedures', authMiddleware, requireRole("ADMIN"), getAllProcedures);
router.delete("/admin/gestionProcedure/delete_Procedure/:procedureId", authMiddleware, requireRole("ADMIN"), deleteProcedure);

module.exports = router;