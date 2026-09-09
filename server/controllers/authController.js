const crypto = require('crypto');
const supabaseAdmin = require('../config/supabaseAdmin');
const { generateToken } = require('../utils/tokenUtils');

/**
 * Hash password with SHA-256 matching Supabase RPC verify_user_credentials format
 */
function hashSHA256(password) {
    if (!password) return '';
    return crypto.createHash('sha256').update(String(password)).digest('hex');
}

/**
 * @desc    Register a new user in Supabase public.users table
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
    try {
        const username = String(req.body.username || '').trim();
        const password = String(req.body.password || '');
        const name = String(req.body.name || req.body.full_name || username).trim();
        const email = String(req.body.email || '').trim();

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username and password are required.'
            });
        }

        // Check if username already exists in Supabase public.users table
        const { data: existingUsers, error: checkErr } = await supabaseAdmin
            .from('users')
            .select('username')
            .eq('username', username);

        if (checkErr) {
            console.error('[authController] Check existing user error:', checkErr);
        }

        if (existingUsers && existingUsers.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Username is already taken. Please choose a different handle.'
            });
        }

        const password_hash = hashSHA256(password);

        // Insert new user record into public.users
        const { data: insertedUsers, error: insertErr } = await supabaseAdmin
            .from('users')
            .insert([{
                username: username,
                password_hash: password_hash,
                full_name: name,
                email: email,
                is_admin: false,
                login_count: 1,
                last_login_at: new Date().toISOString()
            }])
            .select('username, email, full_name, is_admin');

        if (insertErr) {
            console.error('[authController] User registration insert error:', insertErr);
            return res.status(500).json({
                success: false,
                message: 'Failed to register user account.'
            });
        }

        const newUser = insertedUsers[0];
        const sessionUser = {
            id: newUser.username,
            username: newUser.username,
            email: newUser.email || '',
            name: newUser.full_name || newUser.username,
            is_admin: false,
            role: 'user'
        };

        const token = generateToken(sessionUser);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token,
            user: sessionUser
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Authenticate user & get token using verify_user_credentials RPC
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
    try {
        const cleanId = String(req.body.username || req.body.email || '').trim();
        const password = String(req.body.password || '');

        if (!cleanId || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please enter your username/email and password.'
            });
        }

        const hashedInput = hashSHA256(password);

        // Call Supabase Postgres RPC function verify_user_credentials
        const { data: rpcUsers, error: rpcErr } = await supabaseAdmin
            .rpc('verify_user_credentials', { p_login: cleanId, p_password_hash: hashedInput });

        if (rpcErr || !rpcUsers || rpcUsers.length === 0) {
            if (rpcErr) console.error('[authController] RPC error:', rpcErr);
            return res.status(401).json({
                success: false,
                message: 'Invalid username or password.'
            });
        }

        const u = rpcUsers[0];
        const isAdmin = u.is_admin === true || u.is_admin === 'true';

        const sessionUser = {
            id: u.username,
            username: u.username,
            email: u.email || '',
            name: u.full_name || u.username,
            is_admin: isAdmin,
            role: isAdmin ? 'admin' : 'user'
        };

        const token = generateToken(sessionUser);

        // Asynchronously update last login timestamp
        supabaseAdmin.from('users').update({
            last_login_at: new Date().toISOString()
        }).eq('username', u.username).then(() => {}).catch(() => {});

        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: sessionUser
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Logout user (client-side clears token)
 * @route   POST /api/auth/logout
 * @access  Public / Optional Auth
 */
const logout = async (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Logged out successfully'
    });
};

/**
 * @desc    Get currently logged in user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res) => {
    res.status(200).json({
        success: true,
        user: req.user
    });
};

module.exports = {
    register,
    login,
    logout,
    getMe
};
