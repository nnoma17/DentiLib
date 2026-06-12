const express = require("express");
const {
  getAllProcedures,
  updateProcedurePrice,
  getCatalogue 
} = require("../../controllers/prothesiste/gestionCatalogue.controller");
const authMiddleware = require("../../middleware/authMiddleware");

const router = express.Router();
router.get('/prothesiste/get_all_procedures', authMiddleware, getAllProcedures);
router.put('/prothesiste/update_procedure_price/:procedureId', authMiddleware, updateProcedurePrice);
router.get("/prothesiste/get_catalogue", authMiddleware, getCatalogue);
module.exports = router;