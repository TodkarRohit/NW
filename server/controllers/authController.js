const User = require('../models/User');
const { generateToken } = require('../utils/tokenUtils');

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
    try {
        const { username, password } = req.body;

        // Check if username is already taken
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'Username is already taken. Please choose a different 8-character username.'
            });
        }

        // Create new user (password is automatically hashed via User model pre-save hook)
        const user = await User.create({
            username,
            password
        });

        // Generate JWT Token
        const token = generateToken(user);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token,
            user: {
                id: user._id,
                username: user.username,
                createdAt: user.createdAt
            }
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
    try {
        const { username, password } = req.body;

        // Find user by username
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid username or password'
            });
        }

        // Check password match using bcrypt
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid username or password'
            });
        }

        // Generate JWT Token
        const token = generateToken(user);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                username: user.username,
                createdAt: user.createdAt
            }
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
