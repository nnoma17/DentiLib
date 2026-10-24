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

// En-tetes de securite (OWASP A06) - appliques avant toute route.
const { securityHeaders, rateLimit } = require('./backend/middleware/securityMiddleware');
app.use(securityHeaders);

app.use(express.json({ limit: '1mb' }));
app.use(express.static('public'));

// Rate limiting : general sur l'API, strict sur les routes sensibles.
const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: 'Trop de tentatives depuis cette adresse, réessayez plus tard.'
});
app.use('/api', apiLimiter);
app.use('/api/user/login_User', authLimiter);
app.use('/api/admin/create_Admin', authLimiter);

const userRoutes = require('./backend/routes/userAuth.route');  
const gestionUser = require('./backend/routes/admin/gestionUser.route');
const gestionProcedure = require('./backend/routes/admin/gestionProcedure.route');
const gestionWorksheetD = require('./backend/routes/dentiste/gestionWorksheet.route');
const gestionWorksheetP = require('./backend/routes/prothesiste/gestionWorksheet.route');
const gestionCatalogue = require('./backend/routes/prothesiste/gestionCatalogue.route');

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

// Gestion centralisee des erreurs : on ne renvoie jamais la pile d'appels
// au client (elle est consignee cote serveur uniquement).
app.use((err, req, res, next) => {
    console.error('[ERREUR SERVEUR]', err);

    if (res.headersSent) {
        return next(err);
    }

    return res.status(err.status || 500).json({
        success: false,
        message: 'Une erreur interne est survenue'
    });
});

module.exports = app;
