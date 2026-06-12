const { Acte, Log } = require("../../models");

/* =========================
   CREATE PROCEDURE
========================= */
const createProcedure = async (req, res) => {
  const { name, description } = req.body;

  try {
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Le nom est obligatoire"
      });
    }

    const alreadyExists = await Acte.findOne({
      where: { name }
    });

    if (alreadyExists) {
      return res.status(409).json({
        success: false,
        message: "Un acte avec ce nom existe déjà"
      });
    }

    const acte = await Acte.create({
      name,
      description
    });

    await Log.create({
      user_id: req.user?.id_user || req.user?.id,
      action: "CREATION_ACTE",
      target_id: acte.idProcedure
    });

    return res.status(201).json({
      success: true,
      message: "Acte créé",
      acte
    });

  } catch (error) {
    console.error("createProcedure ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "une erreur est survenue",
      error: error.message
    });
  }
};

/* =========================
   DELETE PROCEDURE
========================= */
const deleteProcedure = async (req, res) => {
  const { procedureId } = req.params;

  try {
    const acte = await Acte.findOne({
      where: { idProcedure: procedureId }
    });

    if (!acte) {
      return res.status(404).json({
        success: false,
        message: "Acte non trouvé"
      });
    }

    await Acte.destroy({
      where: { idProcedure: procedureId }
    });

    await Log.create({
      user_id: req.user?.id_user || req.user?.id,
      action: "SUPPRESSION_ACTE",
      target_id: procedureId
    });

    return res.status(200).json({
      success: true,
      message: "Acte supprimé"
    });

  } catch (error) {
    console.error("deleteProcedure ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "une erreur est survenue",
      error: error.message
    });
  }
};

/* =========================
   GET ALL PROCEDURES
========================= */
const getAllProcedures = async (req, res) => {
  try {
    const actes = await Acte.findAll();

    return res.status(200).json({
      success: true,
      procedures: actes
    });

  } catch (error) {
    console.error("getAllProcedures ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "une erreur est survenue",
      error: error.message
    });
  }
};

/* =========================
   MODIFY PROCEDURE
========================= */
const modifyProcedure = async (req, res) => {
  const { name, description } = req.body;
  const procedureId = req.params.procedureId;

  try {
    const acte = await Acte.findOne({
      where: { idProcedure: procedureId }
    });

    if (!acte) {
      return res.status(404).json({
        success: false,
        message: "Acte non trouvé"
      });
    }

    if (name) {
      const nameAlreadyUsed = await Acte.findOne({
        where: { name }
      });

      if (nameAlreadyUsed && nameAlreadyUsed.idProcedure !== acte.idProcedure) {
        return res.status(409).json({
          success: false,
          message: "Ce nom est déjà utilisé"
        });
      }
    }

    await Acte.update(
      {
        name: name || acte.name,
        description: description || acte.description
      },
      {
        where: { idProcedure: procedureId }
      }
    );

    await Log.create({
      user_id: req.user?.id_user || req.user?.id,
      action: "MISE_A_JOUR_ACTE",
      target_id: procedureId
    });

    return res.status(200).json({
      success: true,
      message: "Acte mis à jour"
    });

  } catch (error) {
    console.error("modifyProcedure ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "une erreur est survenue",
      error: error.message
    });
  }
};

module.exports = {
  createProcedure,
  deleteProcedure,
  getAllProcedures,
  modifyProcedure
};