const Procedure = require("../../models/procedure.model");
const jwt = require("jsonwebtoken");

const createProcedure = async (req, res) => {
  const { name, description } = req.body;

    try {
        if (!name)
        return res.json({ success: false, message: "Le nom est obligatoire"});
        
    const alreadyExists = await Procedure.findOne({ name });
    
    if (alreadyExists)
      return res.status(409).json({ success: false, message: "Un acte avec ce nom existe déjà" });

    const procedure = new Procedure({
        name: name,
        description: description
    });
    await procedure.save();

    res.status(201).json({ success: true, message: "Acte créé", procedure });
    
    } catch (error) {
        res.status(500).json({message: "une erreur est survenu", error : error.message});

    }
};

const deleteProcedure = async (req, res) => {
    const { procedureId } = req.params;

    try {
        const procedure = await Procedure.findById(procedureId);
        if (!procedure) {
            return res.status(404).json({
                success: false,
                message: "Acte non trouvé"
            });
        }
        
        await Procedure.findByIdAndDelete(procedureId);

    res.status(200).json({ success: true, message: "Acte supprimé"});
    
    } catch (error) {
        res.status(500).json({message: "une erreur est survenu", error : error.message});

    }
}

//mise a jour d'un acte que l'admin va selectionner
const updateProcedure = async (req, res) => {
    const { name, description} = req.body;
    const procedureId = req.params.procedureId;

    try {
        const procedure = await Procedure.findById(procedureId);

        if (!procedure) {
            return res.status(404).json({
                success: false,
                message: "Acte non trouvé"
            });
        }

        if (name && name !== procedure.name) { //Si different de l'actuel on verifie que le nom n'est pas atribué
            const nameAlreadyUsed = await Procedure.findOne({ name });

            if (nameAlreadyUsed) {
                return res.status(409).json({
                success: false,
                message: "Ce nom est déjà utilisé"
                });
            }
        }

        //mise a jour de l'utilisateur selectionnner avec tous les champs fournis
        procedure.name = name || procedure.name;
        procedure.description = description || procedure.description;

        await procedure.save();

        res.status(200).json({ success: true, message: "Acte mis à jour", procedure });
        

    }catch(error){
        res.status(500).json({message: "une erreur est survenu", error : error.message});
    }
}

const getAllProcedures = async (req, res) => {
    try {
        const procedures = await Procedure.find();
        res.status(200).json({ success: true, procedures });

    } catch (error){
        res.status(500).json({message: "une erreur est survenu", error : error.message});
    }
}

module.exports = {
    createProcedure,
    deleteProcedure,
    updateProcedure,
    getAllProcedures
};
