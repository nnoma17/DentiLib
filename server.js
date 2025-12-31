require('dotenv').config();
const app = require('./app');
const dbConnection = require('./config/dbConfig');

const port = 3000;

dbConnection();

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
