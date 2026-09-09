const { verifyToken } = require('../utils/tokenUtils');
const supabaseAdmin = require('../config/supabaseAdmin');

/**
 * Protect middleware: Rejects requests with missing, invalid, or expired JWT
 * Verifies JWT token and checks active user record in Supabase public.users table
 */
const protect = async (req, res, next) => {
    let token;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Access denied. No authentication token provided.'
        });
    }

    try {
        const decoded = verifyToken(token);
        const username = decoded ? (decoded.username || decoded.id) : null;

        if (!username) {
            return res.status(401).json({
                success: false,
                message: 'Invalid authentication token.'
            });
        }

        const { data: users, error } = await supabaseAdmin
            .from('users')
            .select('username, email, full_name, is_admin')
            .eq('username', username);

        if (error || !users || users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Authentication failed. User no longer exists.'
            });
        }

        const u = users[0];
        const isAdmin = u.is_admin === true || u.is_admin === 'true';

        req.user = {
            id: u.username,
            username: u.username,
            email: u.email || '',
            name: u.full_name || u.username,
            is_admin: isAdmin,
            role: isAdmin ? 'admin' : 'user'
        };

        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Authentication token has expired. Please log in again.'
            });
        }
        return res.status(401).json({
            success: false,
            message: 'Invalid authentication token.'
        });
    }
};

/**
 * Optional Auth middleware: Attaches req.user if a valid token is provided,
 * but allows guest users through without blocking.
 */
const optionalAuth = async (req, res, next) => {
    let token;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    }

    if (!token) {
        req.user = null;
        return next();
    }

    try {
        const decoded = verifyToken(token);
        const username = decoded ? (decoded.username || decoded.id) : null;
        if (!username) {
            req.user = null;
            return next();
        }

        const { data: users } = await supabaseAdmin
            .from('users')
            .select('username, email, full_name, is_admin')
            .eq('username', username);

        if (users && users.length > 0) {
            const u = users[0];
            const isAdmin = u.is_admin === true || u.is_admin === 'true';
            req.user = {
                id: u.username,
                username: u.username,
                email: u.email || '',
                name: u.full_name || u.username,
                is_admin: isAdmin,
                role: isAdmin ? 'admin' : 'user'
            };
        } else {
            req.user = null;
        }
    } catch {
        req.user = null;
    }

    next();
};

/**
 * RequireAdmin middleware: Validates that req.user has is_admin === true
 */
const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.is_admin !== true) {
        return res.status(403).json({
            success: false,
            message: 'Admin access required.'
        });
    }
    next();
};

module.exports = {
    protect,
    optionalAuth,
    requireAdmin
};
