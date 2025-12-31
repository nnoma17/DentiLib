require('dotenv').config();
const app = require('./app');
const dbConnection = require('./config/dbConfig');

// Connexion à la base
dbConnection().then(() => {
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
    });
}).catch((err) => {
    console.error("Erreur connexion DB :", err);
});
