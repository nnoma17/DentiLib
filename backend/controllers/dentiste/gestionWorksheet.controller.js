const { FicheTravaux, Utilisateur, Log, Acte, FicheTravauxActe, CatalogueProthesiste, sequelize } = require("../../models");
const { WORKSHEET_STATUS, USER_ROLES } = require("../../../utils/constants");
const { findAccessibleWorksheet } = require("../../utils/accessControl");
const { canActOnStatus, canDeleteWorksheet, canSetStatus } = require("../../../utils/workflow");
const {
  isValidEmail,
  isValidNumSecu,
  sanitizeText,
  toPositiveInt,
  MAX_NAME_LENGTH,
  MAX_EMAIL_LENGTH,
  MAX_COMMENT_LENGTH
} = require("../../../utils/validators");

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

    // ---- Validation serveur des donnees de la fiche ----
    if (!numWorkSheet || !firstNamePatient || !lastNamePatient || !emailNamePatient || !numSecuPatient) {
      return res.status(400).json({ success: false, message: "Champs manquants" });
    }

    if (!isValidEmail(emailNamePatient)) {
      return res.status(400).json({ success: false, message: "Format email invalide" });
    }

    if (!isValidNumSecu(numSecuPatient)) {
      return res.status(400).json({
        success: false,
        message: "Le numéro de sécurité sociale doit contenir uniquement des chiffres"
      });
    }

    // Le prothesiste doit exister et etre de type PROTHESISTE.
    const prothesisteId = toPositiveInt(idProthesiste);
    if (!prothesisteId) {
      return res.status(400).json({ success: false, message: "Prothésiste manquant" });
    }

    const prothesiste = await Utilisateur.findOne({
      where: { id_user: prothesisteId, role: USER_ROLES.PROTHESISTE }
    });
    if (!prothesiste) {
      return res.status(404).json({ success: false, message: "Prothésiste introuvable" });
    }

    const existing = await FicheTravaux.findOne({ where: { numWorkSheet } });
    if (existing) {
      return res.status(409).json({ success: false, message: "Numéro de fiche déjà existant" });
    }

    const worksheet = await sequelize.transaction(async (t) => { //Tout ou rien evite toucher des données partiellement
      const created = await FicheTravaux.create({
        numWorkSheet,
        status: WORKSHEET_STATUS.A_VALIDER,
        comment: sanitizeText(comment, MAX_COMMENT_LENGTH),
        lastNamePatient: sanitizeText(lastNamePatient, MAX_NAME_LENGTH),
        firstNamePatient: sanitizeText(firstNamePatient, MAX_NAME_LENGTH),
        emailNamePatient: sanitizeText(emailNamePatient, MAX_EMAIL_LENGTH),
        numSecuPatient: sanitizeText(numSecuPatient, 15),
        idDentist,
        idProthesiste: prothesisteId
      }, { transaction: t });

      if (procedure && Array.isArray(procedure) && procedure.length > 0) {
        const entries = [];
        for (const p of procedure) {
          const acte = await Acte.findOne({ where: { name: p.name }, transaction: t });
          if (acte) {
            entries.push({
              idWorkSheet: created.idWorkSheet,
              idProcedure: acte.idProcedure,
              price: p.price || 0,
              description: p.description || null
            });
          }
        }
        if (entries.length > 0) await FicheTravauxActe.bulkCreate(entries, { transaction: t });
      }

      await Log.create({
        user_id: req.user.id,
        action: "CREATION_FICHE",
        target_id: created.idWorkSheet
      }, { transaction: t });

      return created;
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
    // Reserve a l'ADMIN : liste globale des fiches pour le back-office.
    const worksheets = await FicheTravaux.findAll({
      include: [{ model: Acte, through: { attributes: ["price"] } }],
      order: [["date_creation", "DESC"]]
    });
    return res.status(200).json({ success: true, count: worksheets.length, worksheets });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


/* =========================
   GET ALL WORKSHEETS BY DENTIST
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
    // Controle d'acces : la fiche doit appartenir au dentiste connecte
    // (OWASP A05 - IDOR).
    const worksheet = await findAccessibleWorksheet(
      req.user,
      req.params.worksheetId,
      { include: [{ model: Acte, through: { attributes: ["price", "description"] } }] }
    );

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

    // Regle de gestion : le dentiste ne fait passer la fiche qu'a "En attente"
    // (envoi vers l'atelier) et uniquement depuis "A valider".
    if (!canSetStatus(req.user.role, status)) {
      return res.status(403).json({
        success: false,
        message: "Vous n'êtes pas autorisé à placer la fiche dans ce statut"
      });
    }

    const worksheet = await findAccessibleWorksheet(req.user, worksheetId);
    if (!worksheet) {
      return res.status(404).json({ success: false, message: "Fiche non trouvée" });
    }

    if (!canActOnStatus(req.user.role, worksheet.status)) {
      return res.status(403).json({
        success: false,
        message: "Cette fiche n'est plus modifiable à ce stade"
      });
    }

    await FicheTravaux.update({ status }, { where: { idWorkSheet: worksheet.idWorkSheet } });

    await Log.create({ user_id: req.user.id, action: "VALIDATION_FICHE", target_id: worksheet.idWorkSheet });

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

    // Controle d'acces : la fiche doit appartenir au dentiste connecte.
    const worksheet = await findAccessibleWorksheet(req.user, worksheetId);
    if (!worksheet) {
      return res.status(404).json({ success: false, message: "Fiche non trouvée" });
    }

    // Regle de gestion : une fiche deja transmise a l'atelier n'est plus
    // modifiable par le dentiste.
    if (!canActOnStatus(req.user.role, worksheet.status)) {
      return res.status(403).json({
        success: false,
        message: "Cette fiche n'est plus modifiable"
      });
    }

    // On extrait les champs scalaires uniquement (pas procedure)
    const { firstNamePatient, lastNamePatient, emailNamePatient, numSecuPatient, comment } = req.body;

    if (emailNamePatient && !isValidEmail(emailNamePatient)) {
      return res.status(400).json({ success: false, message: "Format email invalide" });
    }

    if (numSecuPatient && !isValidNumSecu(numSecuPatient)) {
      return res.status(400).json({
        success: false,
        message: "Le numéro de sécurité sociale doit contenir uniquement des chiffres"
      });
    }

    await sequelize.transaction(async (t) => {
      await FicheTravaux.update(
        {
          firstNamePatient: sanitizeText(firstNamePatient, MAX_NAME_LENGTH),
          lastNamePatient: sanitizeText(lastNamePatient, MAX_NAME_LENGTH),
          emailNamePatient: sanitizeText(emailNamePatient, MAX_EMAIL_LENGTH),
          numSecuPatient: sanitizeText(numSecuPatient, 15),
          comment: sanitizeText(comment, MAX_COMMENT_LENGTH)
        },
        { where: { idWorkSheet: worksheet.idWorkSheet }, transaction: t }
      );

      if (req.body.procedure && Array.isArray(req.body.procedure)) {
        await FicheTravauxActe.destroy({
          where: { idWorkSheet: worksheet.idWorkSheet },
          transaction: t
        });

        const entries = [];
        for (const p of req.body.procedure) {
          const acte = await Acte.findOne({ where: { name: p.name }, transaction: t });
          if (acte) {
            entries.push({
              idWorkSheet: worksheet.idWorkSheet,
              idProcedure: acte.idProcedure,
              price: p.price || 0,
              description: p.description || null
            });
          }
        }
        if (entries.length > 0) await FicheTravauxActe.bulkCreate(entries, { transaction: t });
      }

      await Log.create(
        { user_id: req.user.id, action: "MISE_A_JOUR_FICHE", target_id: worksheet.idWorkSheet },
        { transaction: t }
      );
    });

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

    // Controle d'acces : la fiche doit appartenir au dentiste connecte.
    const worksheet = await findAccessibleWorksheet(req.user, worksheetId);
    if (!worksheet) {
      return res.status(404).json({ success: false, message: "Fiche non trouvée" });
    }

    // Regle de gestion : suppression possible tant que la fiche n'est pas
    // engagee dans le circuit (statut "A valider" ou "Termine").
    if (!canDeleteWorksheet(req.user.role, worksheet.status)) {
      return res.status(403).json({
        success: false,
        message: "Cette fiche ne peut pas être supprimée à ce stade"
      });
    }

    // Transaction : suppression des actes + de la fiche + log, tout ou rien.
    await sequelize.transaction(async (t) => {
      await FicheTravauxActe.destroy({
        where: { idWorkSheet: worksheet.idWorkSheet },
        transaction: t
      });
      await FicheTravaux.destroy({
        where: { idWorkSheet: worksheet.idWorkSheet },
        transaction: t
      });
      await Log.create(
        { user_id: req.user.id, action: "SUPPRESSION_FICHE", target_id: worksheet.idWorkSheet },
        { transaction: t }
      );
    });

    return res.status(200).json({ success: true, message: "Fiche supprimée" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getAssociatedProthesist = async (req, res) => {
  try {
    const dentist = await Utilisateur.findOne({ where: { id_user: req.user.id } });

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