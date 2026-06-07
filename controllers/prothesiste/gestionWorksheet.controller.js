const Worksheet = require("../../models/workSheet.model");
const User = require("../../models/user.model");
const { WORKSHEET_STATUS } = require("../../utils/constants");

//-------------------------------------------------
// recuperer toutes les worksheets du prothésiste
//-------------------------------------------------
exports.getAllWorksheets = async (req, res) => {
  try {
    const prothesisteId = req.user.id;

    const user = await User.findById(prothesisteId);

    if (!user || !user.associatedUser) {
      return res.json({ success: true, worksheets: [] });
    }

    const dentistId = user.associatedUser;

    const worksheets = await Worksheet.find({
      idDentist: dentistId,
      status: { $ne: "A valider" }
    })
    .populate("procedure.acte")   // 🔥 IMPORTANT
    .populate("idDentist", "firstName lastName email")
    .sort({ createdAt: -1 });

    return res.json({ success: true, worksheets });

  } catch (err) {
    console.error("getAllWorksheets:", err);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur"
    });
  }
};


//-------------------------------------------------
// récupérer la fiche par ID
//-------------------------------------------------
exports.getWorksheetById = async (req, res) => {
  try {
    const worksheet = await Worksheet.findById(req.params.worksheetId)
    .populate("idDentist", "firstName lastName email");

    if (!worksheet) {
      return res.status(404).json({
        success: false,
        message: "Worksheet non trouvé"
      });
    }

    res.json({ success: true, worksheet });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};


//-------------------------------------------------
// Récupérer le dentiste associé
//-------------------------------------------------
exports.getAssociatedDentist = async (req, res) => {
  try {
    const prothesisteId = req.user.id;

    const user = await User.findById(prothesisteId);

    if (!user?.associatedUser) {
      return res.json({ success: true, dentists: [] });
    }

    const dentist = await User.findById(user.associatedUser)
      .select("_id firstName lastName email");

    return res.json({
      success: true,
      dentists: dentist ? [dentist] : []
    });

  } catch (err) {
    console.error("getAssociatedDentist:", err);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur"
    });
  }
};


//-------------------------------------------------
// mise à jours status fiche
//-------------------------------------------------
exports.updateWorksheetStatus = async (req, res) => {
  try {
    const { worksheetId } = req.params;
    const { status } = req.body;

    const allowed = Object.values(WORKSHEET_STATUS);

    if (!allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Statut invalide"
      });
    }

    const worksheet = await Worksheet.findById(worksheetId);

    if (!worksheet) {
      return res.status(404).json({
        success: false,
        message: "Worksheet non trouvée"
      });
    }

    worksheet.status = status;
    await worksheet.save();

    return res.json({
      success: true,
      message: "Statut mis à jour avec succès",
      worksheet
    });

  } catch (err) {
    console.error("updateWorksheetStatus:", err);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur"
    });
  }
};