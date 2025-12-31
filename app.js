// app.js
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware CORS
const allowedOrigins = [
    'http://localhost:3000', // Dev local
    'https://dentilib-5sk3.onrender.com' // Front prod Render
];

app.use(cors({
    origin: function(origin, callback){
        // Autoriser requêtes sans origin (ex : Postman)
        if(!origin) return callback(null, true);
        if(allowedOrigins.indexOf(origin) === -1){
            const msg = `CORS non autorisé pour ${origin}`;
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    methods: ['GET','POST','PUT','DELETE'],
    credentials: true
}));

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

// Page d'accueil
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/html/login.html'));
});

module.exports = app;
