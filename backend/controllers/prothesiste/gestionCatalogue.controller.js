const {
  Acte,
  Utilisateur,
  CatalogueProthesiste,
  Log
} = require("../../models");

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
      message: "Erreur serveur"
    });
  }
};

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

    //Vérification prothésiste
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

    //Vérification acte
    const acte = await Acte.findOne({
      where: { idProcedure: procedureId }
    });

    if (!acte) {
      return res.status(404).json({
        success: false,
        message: "Acte non trouvé"
      });
    }

    // Existe
    const existing = await CatalogueProthesiste.findOne({
      where: {
        idProthesiste: prothesistId,
        idProcedure: procedureId
      }
    });

    //Supprime si prix à 0
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

    //Met à jour si déjà dans le catalogue
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

    //Créer si le prix devient > 0
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

    return res.status(500).json({
      success: false,
      message: "Erreur serveur",
      error: err.message
    });
  }
};