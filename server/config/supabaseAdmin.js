const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'https://qkasthiyysuussaxtkzi.supabase.co';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceRoleKey) {
    console.warn('[supabaseAdmin] Warning: SUPABASE_SERVICE_ROLE_KEY is not defined in environment variables.');
}

const supabaseAdmin = createClient(
    supabaseUrl,
    supabaseServiceRoleKey || 'placeholder_key'
);

module.exports = supabaseAdmin;
