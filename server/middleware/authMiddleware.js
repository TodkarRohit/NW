const { verifyToken } = require('../utils/tokenUtils');
const User = require('../models/User');

/**
 * Protect middleware: Rejects requests with missing, invalid, or expired JWT
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
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication failed. User no longer exists.'
            });
        }

        req.user = user;
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
        const user = await User.findById(decoded.id).select('-password');
        req.user = user || null;
    } catch {
        req.user = null;
    }

    next();
};

module.exports = {
    protect,
    optionalAuth
};
