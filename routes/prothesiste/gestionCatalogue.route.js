const express = require("express");
const {
  getAllProcedures,
  updateProcedurePrice,
  getMe
} = require("../../controllers/prothesiste/gestionCatalogue.controller");
const authMiddleware = require("../../middleware/authMiddleware");

const router = express.Router();

// Récupérer toutes les procédures créées par l'admin
router.get('/prothesiste/get_all_procedures', authMiddleware, getAllProcedures);

// Mettre à jour le prix d'une procédure
router.put('/prothesiste/update_procedure_price/:procedureId', authMiddleware, updateProcedurePrice);


module.exports = router;
