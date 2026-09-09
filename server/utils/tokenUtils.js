const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'enh_jwt_secret_key_development_only';

/**
 * Generate a signed JWT token for a user
 * @param {object} user - User document or payload object with username
 * @returns {string} - JWT Token
 */
function generateToken(user) {
    const username = (typeof user === 'object' && user) ? (user.username || user.id) : String(user);
    return jwt.sign(
        {
            id: username,
            username: username
        },
        JWT_SECRET,
        {
            expiresIn: '24h'
        }
    );
}

/**
 * Verify a JWT token
 * @param {string} token - JWT Token
 * @returns {object} - Decoded payload
 */
function verifyToken(token) {
    return jwt.verify(token, JWT_SECRET);
}

module.exports = {
    generateToken,
    verifyToken
};
