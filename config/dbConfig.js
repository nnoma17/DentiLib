const mongoose = require('mongoose');

const connectDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MONGO_URI =", process.env.MONGO_URI?.slice(0, 20));
        console.log('Database connected successfully');
    } catch (error) {
        console.error('Error connecting to the database', error);
    }
};
module.exports = connectDatabase;