require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const app = require('../app');
const { sequelize } = require('./models');

const PORT = process.env.PORT || 3000;

sequelize.authenticate()
    .then(() => {
        console.log("✅ MySQL connecté");
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("Erreur MySQL :", err);
    });