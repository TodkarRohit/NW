const jwt = require('jsonwebtoken');

/**
 * Generate a signed JWT token for a user
 * @param {object} user - User document or payload object with _id and username
 * @returns {string} - JWT Token
 */
function generateToken(user) {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET is not configured in environment variables');
    }

    return jwt.sign(
        {
            id: user._id || user.id,
            username: user.username
        },
        secret,
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
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET is not configured in environment variables');
    }

    return jwt.verify(token, secret);
}

module.exports = {
    generateToken,
    verifyToken
};
