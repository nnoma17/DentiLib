const Procedure = require("../../models/procedure.model");
const User = require("../../models/user.model");

exports.getAllProcedures = async (req, res) => {
    try {
        const procedures = await Procedure.find().lean();

        res.json({ success: true, procedures });

    } catch (err) {
        console.error("getAllProcedures:", err);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

exports.updateProcedurePrice = async (req, res) => {
    try {
        const prothesistId = req.user.id; // depuis le middleware auth
        const { price } = req.body;
        const procedureId = req.params.procedureId;

        if (price < 0) price = 0;

        const prothesist = await User.findById(prothesistId);
        if (!prothesist) return res.status(404).json({ success: false, message: "Prothésiste non trouvé" });

        // Vérifier si la procédure existe déjà dans listeActes
        const existingIndex = prothesist.listeActes.findIndex(a => String(a.acte) === procedureId);

        if (existingIndex !== -1) {
            // Mise à jour du prix
            prothesist.listeActes[existingIndex].price = price;
        } else if (price > 0) {
            // Ajouter la procédure si price > 0
            prothesist.listeActes.push({ acte: procedureId, price });
        }

        // Si price = 0, retirer la procédure du catalogue
        if (existingIndex !== -1 && price === 0) {
            prothesist.listeActes.splice(existingIndex, 1);
        }

        await prothesist.save();

        res.json({ success: true, message: "Prix mis à jour avec succès" });
    } catch (err) {
        console.error("updateProcedurePrice:", err);
        res.status(500).json({ success: false, message: "Erreur serveur", error: err.message });
    }
};
