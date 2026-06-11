const { Utilisateur, Acte } = require('../backend/models');

(async () => {
  try {
    const users = await Utilisateur.findAll();
    const actes = await Acte.findAll();

    console.log("USERS:", users.length);
    console.log("ACTES:", actes.length);
  } catch (err) {
    console.error(err);
  }
})();