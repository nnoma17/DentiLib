require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // Chemin absolu pour les fichiers statiques

// Routes
const userRoutes = require('./routes/userAuth.route');  
const gestionUser = require('./routes/admin/gestionUser.route');
const gestionProcedure = require('./routes/admin/gestionProcedure.route');
const gestionWorksheetD = require('./routes/dentiste/gestionWorksheet.route');
const gestionWorksheetP = require('./routes/prothesiste/gestionWorksheet.route');
const gestionCatalogue = require('./routes/prothesiste/gestionCatalogue.route');

app.use('/api', userRoutes);
app.use('/api', gestionUser);
app.use('/api', gestionProcedure);
app.use('/api', gestionWorksheetD);
app.use('/api', gestionWorksheetP);
app.use('/api', gestionCatalogue);

// Route principale
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'login.html'));
});

// Démarrage serveur toujours actif
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

module.exports = app; // Toujours exporter app pour les tests
