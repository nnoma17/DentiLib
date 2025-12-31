const express = require('express');
const path = require('path');

const app = express();

app.use(express.json());
app.use(express.static('public'));

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

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/html/login.html'));
});

module.exports = app;
