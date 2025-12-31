const Worksheet = require("../../models/workSheet.model");
const User = require("../../models/user.model");

exports.getAllWorksheets = async (req, res) => {
  try {
    const prothesisteId = req.user._id;

    // Worksheets associées au prothésiste, pas "A valider" car unqiuement pour le dentiste
    const worksheets = await Worksheet.find({
      prothesiste: prothesisteId,
      status: { $ne: "A valider" },
    }).sort({ createdAt: -1 });

    res.json({ success: true, worksheets });
  } catch (err) {
    console.error("getAllWorksheets:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

/* =========================
   GET : worksheet par ID
========================= */
exports.getWorksheetById = async (req, res) => {
  try {
    const worksheetId = req.params.worksheetId;
    const prothesisteId = req.user._id;

    const worksheet = await Worksheet.findOne({
      _id: worksheetId,
      prothesiste: prothesisteId,
    });

    if (!worksheet) {
      return res.status(404).json({
        success: false,
        message: "Worksheet non trouvé ou non autorisé",
      });
    }

    res.json({ success: true, worksheet });
  } catch (err) {
    console.error("getWorksheetById:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

/* =========================
   GET : récupérer le dentiste associé à la worksheet
========================= */
exports.getAssociatedDentist = async (req, res) => {
  try {
    const prothesisteId = req.user._id;

    // Récupère toutes les worksheets du prothésiste
    const worksheets = await Worksheet.find({ prothesiste: prothesisteId });

    // Récupère la liste des dentistes associés
    const dentistIds = worksheets.map(ws => ws.dentiste.toString());
    const uniqueDentistIds = [...new Set(dentistIds)];

    const dentists = await User.find({ _id: { $in: uniqueDentistIds } }).select(
      "_id firstName lastName email"
    );

    res.json({ success: true, dentists });
  } catch (err) {
    console.error("getAssociatedDentist:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

exports.updateWorksheetStatus = async (req, res) => {
    try {
        const { worksheetId } = req.params;
        const { status } = req.body;

        if (!status) return res.status(400).json({ success: false, message: "Statut requis" });

        const worksheet = await Worksheet.findById(worksheetId);
        if (!worksheet) return res.status(404).json({ success: false, message: "Worksheet non trouvée" });

        worksheet.status = status;
        await worksheet.save();

        res.json({ success: true, message: "Statut mis à jour avec succès", worksheet });
    } catch (err) {
        console.error("updateWorksheetStatus:", err);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};