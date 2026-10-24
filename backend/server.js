const { getConfig } = require('./config/env');

let config;
try {
    // La configuration est validee AVANT toute connexion : le serveur refuse
    // de demarrer si une variable d'environnement critique est absente.
    config = getConfig();
} catch (error) {
    console.error(error.message);
    process.exit(1);
}

const app = require('../app');
const { sequelize } = require('./models');

const PORT = config.port;

sequelize.authenticate()
    .then(() => {
        console.log("✅ MySQL connecté");
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("Erreur MySQL :", err);
        process.exit(1);
    });