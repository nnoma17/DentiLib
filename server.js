// server.js
require('dotenv').config();
const app = require('./app');
const dbConnection = require('./config/dbConfig');
const { connectSQL } = require('./config/sqlConfig');

const PORT = process.env.PORT || 3000;

// Connexion à la DB et lancement du serveur
dbConnection()
    .then(() => {
        connectSQL();
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("Erreur connexion DB :", err);
    });
