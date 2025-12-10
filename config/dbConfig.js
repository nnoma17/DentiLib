const mongoose = require('mongoose');

const connectDatabase = async () => {
    try {
        await mongoose.connect(process.env.DB_URL);
        console.log('Database connected successfully');
    } catch (error) {
        console.error('Error connecting to the database', error);
    }
};
module.exports = connectDatabase;