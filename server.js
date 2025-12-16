require('dotenv').config();
const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

//Connection database
const dbConnection = require('./config/dbConfig');

dbConnection();

const userRoutes = require('./routes/userAuth.route');
app.use('/api', userRoutes);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

app.get('/', (req, res) => {
    res.send('Bienvenido a mi servidor Express, estoy funcionando correctamente, mi amogo! Vamos a codear juntos!');

    
})