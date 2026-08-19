const { isValidGoogleDriveUrl } = require('../utils/driveValidator');

/**
 * Validate registration request body
 */
const validateRegister = (req, res, next) => {
    let { username, password } = req.body;

    if (!username || typeof username !== 'string') {
        return res.status(400).json({
            success: false,
            message: 'Username is required'
        });
    }

    username = username.trim();

    if (username.length !== 8) {
        return res.status(400).json({
            success: false,
            message: 'Username must be exactly 8 characters long'
        });
    }

    if (!password || typeof password !== 'string') {
        return res.status(400).json({
            success: false,
            message: 'Password is required'
        });
    }

    if (password.length < 6) {
        return res.status(400).json({
            success: false,
            message: 'Password must be at least 6 characters long'
        });
    }

    req.body.username = username;
    next();
};

/**
 * Validate login request body
 */
const validateLogin = (req, res, next) => {
    let { username, password } = req.body;

    if (!username || typeof username !== 'string' || !username.trim()) {
        return res.status(400).json({
            success: false,
            message: 'Username is required'
        });
    }

    if (!password || typeof password !== 'string') {
        return res.status(400).json({
            success: false,
            message: 'Password is required'
        });
    }

    req.body.username = username.trim();
    next();
};

/**
 * Validate Resource creation request body & Google Drive link
 */
const validateResource = (req, res, next) => {
    const { title, subject, googleDriveUrl } = req.body;

    if (!title || typeof title !== 'string' || !title.trim()) {
        return res.status(400).json({
            success: false,
            message: 'Resource title is required'
        });
    }

    if (!subject || typeof subject !== 'string' || !subject.trim()) {
        return res.status(400).json({
            success: false,
            message: 'Subject is required'
        });
    }

    if (!googleDriveUrl || typeof googleDriveUrl !== 'string' || !googleDriveUrl.trim()) {
        return res.status(400).json({
            success: false,
            message: 'Google Drive URL is required'
        });
    }

    if (!isValidGoogleDriveUrl(googleDriveUrl)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid Google Drive URL. Only standard Google Drive or Google Docs sharing links are permitted.'
        });
    }

    next();
};

module.exports = {
    validateRegister,
    validateLogin,
    validateResource
};
