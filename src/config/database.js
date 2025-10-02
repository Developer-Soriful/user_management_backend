const { MongoClient } = require('mongodb');

let db = null;
let client = null;

const connectDB = async () => {
    try {
        client = new MongoClient(process.env.MONGODB_URI);

        await client.connect();
        db = client.db(process.env.DATABASE_NAME);
        console.log('✅ MongoDB Connected Successfully');

        return db;
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

const getDB = () => {
    if (!db) {
        throw new Error('Database not initialized. Call connectDB first.');
    }
    return db;
};

const closeDB = async () => {
    if (client) {
        await client.close();
    }
};

module.exports = { connectDB, getDB, closeDB };