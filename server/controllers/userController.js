const User = require('../models/User');

/**
 * @desc    Get list of all users (Safe fields only)
 * @route   GET /api/users
 * @access  Private (JWT Required)
 */
const getUsers = async (req, res, next) => {
    try {
        const users = await User.find().select('_id username createdAt').sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: users.length,
            users
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getUsers
};
