const mongoose = require('mongoose');

/**
 * Connect to MongoDB using Mongoose
 * Uses MONGO_URI from environment variables
 */
const connectDB = async () => {
    try {
        mongoose.set('bufferTimeoutMS', 2500);
        const connUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/engineering_notes_hub';
        
        const conn = await mongoose.connect(connUri, {
            // Modern Mongoose defaults are optimal
        });

        console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
        return conn;
    } catch (error) {
        console.warn(`[Database Notice] Could not connect to MongoDB at "${process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/engineering_notes_hub'}".`);
        console.warn(`[Database Notice] To enable live database storage, ensure MongoDB is running locally or set a valid MONGO_URI (e.g. MongoDB Atlas) in server/.env.`);
    }
};

mongoose.connection.on('disconnected', () => {
    console.warn('[Database Warning] MongoDB disconnected.');
});

mongoose.connection.on('reconnected', () => {
    console.log('[Database] MongoDB reconnected successfully.');
});

module.exports = connectDB;
