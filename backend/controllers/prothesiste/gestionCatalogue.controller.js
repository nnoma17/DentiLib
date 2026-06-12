const {
  Acte,
  Utilisateur,
  CatalogueProthesiste,
  Log
} = require("../../models");

/* =========================
   GET ALL PROCEDURES (ACTES)
   → liste globale des actes
========================= */
exports.getAllProcedures = async (req, res) => {
  try {
    const procedures = await Acte.findAll();

    return res.status(200).json({
      success: true,
      procedures
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Erreur serveur",
      error: err.message
    });
  }
};


/* =========================
   GET CATALOGUE PROTHÉSISTE
   → actes + prix du prothésiste connecté
========================= */
exports.getCatalogue = async (req, res) => {
  try {
    const prothesistId = Number(req.user.id);

    const catalogue = await CatalogueProthesiste.findAll({
      where: { idProthesiste: prothesistId },
      include: [
        {
          model: Acte
        }
      ]
    });

    return res.status(200).json({
      success: true,
      catalogue
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Erreur serveur",
      error: err.message
    });
  }
};


/* =========================
   UPDATE / UPSERT PRICE
   CatalogueProthesiste
========================= */
exports.updateProcedurePrice = async (req, res) => {
  try {
    const prothesistId = Number(req.user.id);
    const { price } = req.body;
    const procedureId = Number(req.params.procedureId);

    let finalPrice = Number(price);

    if (isNaN(finalPrice)) {
      return res.status(400).json({
        success: false,
        message: "Prix invalide"
      });
    }

    if (finalPrice < 0) finalPrice = 0;

    /* =========================
       Vérification prothésiste
    ========================= */
    const prothesist = await Utilisateur.findOne({
      where: {
        id_user: prothesistId,
        role: "PROTHESISTE"
      }
    });

    if (!prothesist) {
      return res.status(404).json({
        success: false,
        message: "Prothésiste non trouvé"
      });
    }

    /* =========================
       Vérification acte
    ========================= */
    const acte = await Acte.findOne({
      where: { idProcedure: procedureId }
    });

    if (!acte) {
      return res.status(404).json({
        success: false,
        message: "Acte non trouvé"
      });
    }

    /* =========================
       CHECK EXISTENCE
    ========================= */
    const existing = await CatalogueProthesiste.findOne({
      where: {
        idProthesiste: prothesistId,
        idProcedure: procedureId
      }
    });

    /* =========================
       CAS 1 : SUPPRESSION
    ========================= */
    if (finalPrice === 0 && existing) {
      await CatalogueProthesiste.destroy({
        where: {
          idProthesiste: prothesistId,
          idProcedure: procedureId
        }
      });

      await Log.create({
        user_id: prothesistId,
        action: "SUPPRESSION_ACTE_CATALOGUE",
        target_id: procedureId
      });

      return res.status(200).json({
        success: true,
        message: "Acte retiré du catalogue"
      });
    }

    /* =========================
       CAS 2 : UPDATE
    ========================= */
    if (existing) {
      await CatalogueProthesiste.update(
        { price: finalPrice },
        {
          where: {
            idProthesiste: prothesistId,
            idProcedure: procedureId
          }
        }
      );

      await Log.create({
        user_id: prothesistId,
        action: "MISE_A_JOUR_PRIX_CATALOGUE",
        target_id: procedureId
      });

      return res.status(200).json({
        success: true,
        message: "Prix mis à jour"
      });
    }

    /* =========================
       CAS 3 : CREATE
    ========================= */
    if (finalPrice > 0) {
      await CatalogueProthesiste.create({
        idProthesiste: prothesistId,
        idProcedure: procedureId,
        price: finalPrice
      });

      await Log.create({
        user_id: prothesistId,
        action: "AJOUT_ACTE_CATALOGUE",
        target_id: procedureId
      });

      return res.status(201).json({
        success: true,
        message: "Acte ajouté au catalogue"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Aucune modification effectuée"
    });

  } catch (err) {
    console.log("NAME:", err.name);
    console.log("MESSAGE:", err.message);
    console.log("SQL:", err.sql);

    return res.status(500).json({
      success: false,
      message: "Erreur serveur",
      error: err.message
    });
  }
};