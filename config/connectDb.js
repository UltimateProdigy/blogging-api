require("dotenv").config();
const mongoose = require("mongoose");

const connectDb = async () => {
    try {
        const dbURI = process.env.NODE_ENV === 'test' 
            ? process.env.MONGO_TEST_URI 
            : process.env.DATABASE_URI;
        await mongoose.connect(dbURI);
        console.log(`MongoDB connected: ${process.env.NODE_ENV || 'development'}`);
    } catch (error) {
        console.error('Database connection failed:', error);
        process.exit(1);
    }
};

module.exports = connectDb;
