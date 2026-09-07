/**
 * Engineering Notes Hub - Database Account Promotion Utility
 * Promotes a target username directly in MongoDB to role: 'admin'
 */

const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../.env') });

const mongoose = require('mongoose');
const User = require('../models/User');

async function promoteAdmin(targetUsername) {
    if (!targetUsername) {
        console.error('Usage: node server/utils/promoteAdmin.js <8-char-username>');
        process.exit(1);
    }

    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/engineering_notes_hub';
        console.log(`Connecting to MongoDB at ${mongoUri}...`);
        await mongoose.connect(mongoUri);

        const result = await User.updateOne(
            { username: targetUsername },
            { $set: { role: 'admin' } }
        );

        if (result.matchedCount === 0) {
            console.log(`No account found matching username: "${targetUsername}"`);
        } else {
            console.log(`Successfully updated ${result.modifiedCount} account(s). Username "${targetUsername}" is now promoted to role: 'admin'.`);
        }

        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.error('Failed to promote user in MongoDB:', err.message);
        process.exit(1);
    }
}

const target = process.argv[2] || 'rohittod';
promoteAdmin(target);
