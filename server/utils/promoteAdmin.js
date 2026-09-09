/**
 * Engineering Notes Hub - Database Account Promotion Utility
 * Promotes a target username directly in Supabase public.users table to is_admin: true
 */

const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseAdmin = require('../config/supabaseAdmin');

async function promoteAdmin(targetUsername) {
    if (!targetUsername) {
        console.error('Usage: node server/utils/promoteAdmin.js <username>');
        process.exit(1);
    }

    try {
        console.log(`Promoting username "${targetUsername}" in Supabase public.users table...`);

        const { data, error } = await supabaseAdmin
            .from('users')
            .update({ is_admin: true })
            .eq('username', targetUsername)
            .select('username, email, is_admin');

        if (error) {
            console.error('Error promoting admin in Supabase:', error);
            process.exit(1);
        }

        if (!data || data.length === 0) {
            console.log(`No account found matching username: "${targetUsername}"`);
        } else {
            console.log(`Successfully updated ${data.length} account(s). Username "${targetUsername}" is now promoted to is_admin: true.`);
        }

        process.exit(0);
    } catch (err) {
        console.error('Failed to promote user in Supabase:', err.message);
        process.exit(1);
    }
}

const target = process.argv[2] || 'rohittodkar92';
promoteAdmin(target);
