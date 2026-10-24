const express = require("express");
const {
  getAllProcedures,
  updateProcedurePrice,
  getCatalogue 
} = require("../../controllers/prothesiste/gestionCatalogue.controller");
const authMiddleware = require("../../middleware/authMiddleware");
const { requireRole } = require("../../middleware/authMiddleware");

const router = express.Router();

router.get('/prothesiste/get_all_procedures', authMiddleware, requireRole("PROTHESISTE"), getAllProcedures);
router.put('/prothesiste/update_procedure_price/:procedureId', authMiddleware, requireRole("PROTHESISTE"), updateProcedurePrice);
router.get("/prothesiste/get_catalogue", authMiddleware, requireRole("PROTHESISTE"), getCatalogue);
module.exports = router;