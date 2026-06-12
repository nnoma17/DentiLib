const { FicheTravaux, Utilisateur, Log, Acte, FicheTravauxActe, CatalogueProthesiste } = require("../../models");
const { WORKSHEET_STATUS } = require("../../../utils/constants");
const { Op } = require("sequelize");

/* =========================
   CREATE WORKSHEET + ACTES
========================= */
const createWorksheet = async (req, res) => {
  try {
    const {
        numWorkSheet, 
        comment, 
        firstNamePatient, 
        lastNamePatient,
        emailNamePatient, 
        numSecuPatient, 
        procedure, 
        idProthesiste
    } = req.body;

    const idDentist = req.user.id;

    if (!numWorkSheet || !firstNamePatient || !lastNamePatient || !emailNamePatient || !numSecuPatient) {
      return res.status(400).json({ success: false, message: "Champs manquants" });
    }

    const existing = await FicheTravaux.findOne({ where: { numWorkSheet } });
    if (existing) {
      return res.status(409).json({ success: false, message: "Numéro de fiche déjà existant" });
    }

    const worksheet = await FicheTravaux.create({
      numWorkSheet,
      status: WORKSHEET_STATUS.A_VALIDER,
      comment,
      lastNamePatient,
      firstNamePatient,
      emailNamePatient,
      numSecuPatient,
      idDentist,
      idProthesiste
    });

    // Le front envoie des objets {name, description, price} sans idProcedure
    // On résout l'idProcedure via le nom de l'acte
    if (procedure && Array.isArray(procedure) && procedure.length > 0) {
      const entries = [];
      for (const p of procedure) {
        const acte = await Acte.findOne({ where: { name: p.name } });
        if (acte) {
          entries.push({
            idWorkSheet: worksheet.idWorkSheet,
            idProcedure: acte.idProcedure,
            price: p.price || 0,
            description: p.description || null
          });
        }
      }
      if (entries.length > 0) await FicheTravauxActe.bulkCreate(entries);
    }

    await Log.create({
      user_id: req.user.id,
      action: "CREATION_FICHE",
      target_id: worksheet.idWorkSheet
    });

    return res.status(201).json({ success: true, message: "Fiche créée", worksheet });

  } catch (error) {
    return res.status(500).json({ success: false, message: "Erreur création fiche", error: error.message });
  }
};


/* =========================
   GET ALL WORKSHEETS
========================= */
const getAllWorksheets = async (req, res) => {
  try {
    const worksheets = await FicheTravaux.findAll({
      include: [{ model: Acte, through: { attributes: ["price"] } }]
    });
    return res.status(200).json({ success: true, count: worksheets.length, worksheets });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


/* =========================
   GET ALL WORKSHEETS BY DENTIST   ← manquait dans le controller mais la route l'appelle
========================= */
const getAllWorksheetsByDentist = async (req, res) => {
  try {
    const idDentist = req.user.id;
    const worksheets = await FicheTravaux.findAll({
      where: { idDentist },
      include: [{ model: Acte, through: { attributes: ["price"] } }],
      order: [["date_creation", "DESC"]]
    });
    return res.status(200).json({ success: true, count: worksheets.length, worksheets });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


/* =========================
   GET WORKSHEET BY ID
========================= */
const getWorksheetById = async (req, res) => {
  try {
    const worksheet = await FicheTravaux.findOne({
      where: { idWorkSheet: req.params.worksheetId },
      include: [{ model: Acte, through: { attributes: ["price", "description"] } }]
    });
    if (!worksheet) {
      return res.status(404).json({ success: false, message: "Fiche non trouvée" });
    }
    return res.status(200).json({ success: true, worksheet });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


/* =========================
   UPDATE STATUS
========================= */
const updateStatus = async (req, res) => {
  try {
    const { worksheetId } = req.params;
    const { status } = req.body;

    if (!Object.values(WORKSHEET_STATUS).includes(status)) {
      return res.status(400).json({ success: false, message: "Statut invalide" });
    }

    const worksheet = await FicheTravaux.findOne({ where: { idWorkSheet: worksheetId } });
    if (!worksheet) {
      return res.status(404).json({ success: false, message: "Fiche non trouvée" });
    }

    await FicheTravaux.update({ status }, { where: { idWorkSheet: worksheetId } });

    await Log.create({ user_id: req.user.id, action: "VALIDATION_FICHE", target_id: worksheetId });

    return res.status(200).json({ success: true, message: "Statut mis à jour" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


/* =========================
   UPDATE WORKSHEET
========================= */
const updateWorksheet = async (req, res) => {
  try {
    const { worksheetId } = req.params;

    const worksheet = await FicheTravaux.findOne({ where: { idWorkSheet: worksheetId } });
    if (!worksheet) {
      return res.status(404).json({ success: false, message: "Fiche non trouvée" });
    }

    // On extrait les champs scalaires uniquement (pas procedure)
    const { firstNamePatient, lastNamePatient, emailNamePatient, numSecuPatient, comment } = req.body;

    await FicheTravaux.update(
      { firstNamePatient, lastNamePatient, emailNamePatient, numSecuPatient, comment },
      { where: { idWorkSheet: worksheetId } }
    );

    if (req.body.procedure && Array.isArray(req.body.procedure)) {
      await FicheTravauxActe.destroy({ where: { idWorkSheet: worksheetId } });

      const entries = [];
      for (const p of req.body.procedure) {
        const acte = await Acte.findOne({ where: { name: p.name } });
        if (acte) {
          entries.push({
            idWorkSheet: worksheetId,
            idProcedure: acte.idProcedure,
            price: p.price || 0,
            description: p.description || null
          });
        }
      }
      if (entries.length > 0) await FicheTravauxActe.bulkCreate(entries);
    }

    await Log.create({ user_id: req.user.id, action: "MISE_A_JOUR_FICHE", target_id: worksheetId });

    return res.status(200).json({ success: true, message: "Fiche mise à jour" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


/* =========================
   DELETE WORKSHEET
========================= */
const deleteWorksheet = async (req, res) => {
  try {
    const { worksheetId } = req.params;

    const worksheet = await FicheTravaux.findOne({ where: { idWorkSheet: worksheetId } });
    if (!worksheet) {
      return res.status(404).json({ success: false, message: "Fiche non trouvée" });
    }

    await FicheTravauxActe.destroy({ where: { idWorkSheet: worksheetId } });
    await FicheTravaux.destroy({ where: { idWorkSheet: worksheetId } });

    await Log.create({ user_id: req.user.id, action: "SUPPRESSION_FICHE", target_id: worksheetId });
    return res.status(200).json({ success: true, message: "Fiche supprimée" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getAssociatedProthesist = async (req, res) => {
  try {
    const dentist = await Utilisateur.findOne({ where: { idUser: req.user.id } });

    if (!dentist || !dentist.associatedUser) {
      return res.status(404).json({ success: false, message: "Aucun prothésiste associé" });
    }

    const catalogue = await CatalogueProthesiste.findAll({
      where: { idProthesiste: dentist.associatedUser },
      include: [{ model: Acte }]
    });

    const listeActes = catalogue.map(c => ({
      acte: c.Acte,
      price: c.price
    }));

    return res.status(200).json({ success: true, prothesist: { idProthesiste: dentist.associatedUser, listeActes } });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createWorksheet,
  updateStatus,
  getAssociatedProthesist,
  getAllWorksheets,
  getAllWorksheetsByDentist,
  getWorksheetById,
  updateWorksheet,
  deleteWorksheet
};