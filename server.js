require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static('public'));

//Connection database
const dbConnection = require('./config/dbConfig');

dbConnection();

const userRoutes = require('./routes/userAuth.route');
const gestionUser = require('./routes/admin/gestionUser.route');
const gestionProcedure = require('./routes/admin/gestionProcedure.route');

app.use('/api', userRoutes);

//Admin
app.use('/api', gestionUser);
app.use('/api', gestionProcedure);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', './html/login.html'));
})