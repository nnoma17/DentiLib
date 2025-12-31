const WorkSheet = require("../../models/workSheet.model");
const User = require("../../models/user.model");
const Procedure = require("../../models/procedure.model");

/* ===========================
   CRÉER UN WORKSHEET
=========================== */
const createWorksheet = async (req, res) => {
  try {
    const {
      numWorkSheet,
      comment,
      procedure,
      firstNamePatient,
      lastNamePatient,
      emailNamePatient,
      numSecuPatient,
      invoicePDF
    } = req.body;

    const idDentist = req.user.id;

    if (!numWorkSheet || !firstNamePatient || !lastNamePatient || !emailNamePatient || !numSecuPatient || !idDentist) {
      return res.status(400).json({ success: false, message: "Champs manquants" });
    }

    const worksheet = new WorkSheet({
      numWorkSheet,
      comment,
      status: "A valider", // status par défaut
      procedure,
      firstNamePatient,
      lastNamePatient,
      emailNamePatient,
      numSecuPatient,
      invoicePDF,
      idDentist
    });

    await worksheet.save();

    res.status(201).json({
      success: true,
      message: "Worksheet créé avec succès",
      worksheet
    });

  } catch (error) {
    console.error("Erreur createWorksheet :", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la création du worksheet",
      error: error.message
    });
  }
};

/* ===========================
   METTRE À JOUR LE STATUT
=========================== */
const updateStatus = async (req, res) => {
  try {
    const { worksheetId } = req.params;
    const { status } = req.body;

    if (!["A valider", "En attente", "En cours", "Termine"].includes(status)) {
      return res.status(400).json({ success: false, message: "Statut invalide" });
    }

    const updatedWorksheet = await WorkSheet.findByIdAndUpdate(
      worksheetId,
      { status },
      { new: true }
    );

    if (!updatedWorksheet) {
      return res.status(404).json({ success: false, message: "Worksheet non trouvé" });
    }

    res.status(200).json({
      success: true,
      message: `Statut mis à jour en "${status}"`,
      worksheet: updatedWorksheet
    });

  } catch (error) {
    console.error("Erreur updateStatus :", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la mise à jour du statut",
      error: error.message
    });
  }
};

/* ===========================
   AUTRES FONCTIONS (inchangées)
=========================== */
const getAllWorksheets = async (req, res) => {
  try {
    const worksheets = await WorkSheet.find()
      .populate("idDentist", "firstName lastName email");

    res.status(200).json({ success: true, count: worksheets.length, worksheets });
  } catch (error) {
    console.error("Erreur getAllWorksheets :", error);
    res.status(500).json({ success: false, message: "Erreur lors de la récupération des worksheets", error: error.message });
  }
};

const getAllWorksheetsByDentist = async (req, res) => {
  try {
    const dentistId = req.user.id;
    const worksheets = await WorkSheet.find({ idDentist: dentistId })
      .populate("idDentist", "firstName lastName email");

    res.status(200).json({ success: true, count: worksheets.length, worksheets });
  } catch (error) {
    console.error("Erreur getAllWorksheetsByDentist :", error);
    res.status(500).json({ success: false, message: "Erreur lors de la récupération des worksheets du dentiste", error: error.message });
  }
};

const getWorksheetById = async (req, res) => {
  try {
    const { worksheetId } = req.params;
    const worksheet = await WorkSheet.findById(worksheetId)
      .populate("idDentist", "firstName lastName email");

    if (!worksheet) return res.status(404).json({ success: false, message: "Worksheet non trouvé" });
    res.status(200).json({ success: true, worksheet });
  } catch (error) {
    console.error("Erreur getWorksheetById :", error);
    res.status(500).json({ success: false, message: "Erreur lors de la récupération du worksheet", error: error.message });
  }
};

const updateWorksheet = async (req, res) => {
  try {
    const { worksheetId } = req.params;
    const updatedWorksheet = await WorkSheet.findByIdAndUpdate(worksheetId, req.body, { new: true });

    if (!updatedWorksheet) return res.status(404).json({ success: false, message: "Worksheet non trouvé" });
    res.status(200).json({ success: true, message: "Worksheet mis à jour", worksheet: updatedWorksheet });
  } catch (error) {
    console.error("Erreur updateWorksheet :", error);
    res.status(500).json({ success: false, message: "Erreur lors de la mise à jour du worksheet", error: error.message });
  }
};

const deleteWorksheet = async (req, res) => {
  try {
    const { worksheetId } = req.params;
    const deletedWorksheet = await WorkSheet.findByIdAndDelete(worksheetId);

    if (!deletedWorksheet) return res.status(404).json({ success: false, message: "Worksheet non trouvé" });
    res.status(200).json({ success: true, message: "Worksheet supprimé", worksheet: deletedWorksheet });
  } catch (error) {
    console.error("Erreur deleteWorksheet :", error);
    res.status(500).json({ success: false, message: "Erreur lors de la suppression du worksheet", error: error.message });
  }
};

const getAssociatedProthesist = async (req, res) => {
  try {
    const dentistId = req.user.id;
    const dentist = await User.findById(dentistId).populate("associatedUser").exec();

    if (!dentist || !dentist.associatedUser) return res.status(404).json({ success: false, message: "Prothésiste associé non trouvé" });

    const prothesist = await User.findById(dentist.associatedUser._id)
      .populate("listeActes.acte")
      .exec();

    res.status(200).json({ success: true, prothesist });
  } catch (error) {
    console.error("Erreur getAssociatedProthesist :", error);
    res.status(500).json({ success: false, message: "Erreur serveur", error: error.message });
  }
};

const getAssociatedWorksheets = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("associatedUser");

    if (!user || !user.associatedUser) {
      return res.status(200).json({
        success: true,
        worksheets: []
      });
    }

    const worksheets = await WorkSheet.find({
      idDentist: user.associatedUser._id,
      status: { $ne: "A valider" }
    }).populate("idDentist", "firstName lastName email");

    res.status(200).json({
      success: true,
      count: worksheets.length,
      worksheets
    });

  } catch (error) {
    console.error("Erreur getAssociatedWorksheets :", error);
    res.status(500).json({
      success: false,
      message: "Erreur récupération worksheets associées",
      error: error.message
    });
  }
};


module.exports = {
  createWorksheet,
  getAllWorksheets,
  getWorksheetById,
  getAllWorksheetsByDentist,
  updateWorksheet,
  updateStatus,
  deleteWorksheet,
  getAssociatedProthesist,
  getAssociatedWorksheets
};
