const { FicheTravaux, Utilisateur, Log, Acte } = require("../../models");
const { WORKSHEET_STATUS } = require("../../../utils/constants");
const { Op } = require("sequelize");

exports.getAllWorksheets = async (req, res) => {
  try {
    const prothesisteId = req.user.id;

    const worksheets = await FicheTravaux.findAll({
      where: {
        idProthesiste: prothesisteId,
        status: { [Op.ne]: WORKSHEET_STATUS.A_VALIDER }
      },
      order: [["date_creation", "DESC"]]
    });

    return res.json({ success: true, count: worksheets.length, worksheets });

  } catch (err) {
    console.error("getAllWorksheets:", err);
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};


exports.getWorksheetById = async (req, res) => {
  try {
    const worksheet = await FicheTravaux.findOne({
      where: { idWorkSheet: req.params.worksheetId },
      include: [{ model: Acte, through: { attributes: ["price", "description"] } }]
    });

    if (!worksheet) {
      return res.status(404).json({ success: false, message: "Fiche non trouvée" });
    }

    const plain = worksheet.get({ plain: true });

    const procedure = (plain.Actes || []).map(acte => ({
      name: acte.name,
      description: acte.FicheTravauxActe?.description ?? acte.description,
      price: acte.FicheTravauxActe?.price ?? 0
    }));

    return res.json({ success: true, worksheet: { ...plain, procedure } });

  } catch (err) {
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};


exports.getAssociatedDentist = async (req, res) => {
  try {
    const prothesisteId = req.user.id;

    const prothesiste = await Utilisateur.findOne({ where: { idUser: prothesisteId } });

    if (!prothesiste || !prothesiste.associatedUser) {
      return res.json({ success: true, dentists: [] });
    }

    const dentist = await Utilisateur.findOne({
      where: { idUser: prothesiste.associatedUser },
      attributes: ["idUser", "firstName", "lastName", "email"]
    });

    return res.json({ success: true, dentists: dentist ? [dentist] : [] });

  } catch (err) {
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};


exports.updateWorksheetStatus = async (req, res) => {
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

    await Log.create({ user_id: req.user.id, action: "MODIFICATION_STATUS_FICHE", target_id: worksheetId });

    return res.json({
      success: true,
      message: "Statut mis à jour",
      worksheet: { ...worksheet.get({ plain: true }), status }
    });

  } catch (err) {
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};