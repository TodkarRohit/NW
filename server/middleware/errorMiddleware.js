/**
 * Centralized Error Handling Middleware
 * Ensures consistent JSON responses:
 * { "success": false, "message": "..." }
 * Never leaks database credentials, internal stack traces, or secrets.
 */

// 404 Route Not Found Handler
const notFoundHandler = (req, res, next) => {
    res.status(404).json({
        success: false,
        message: `API endpoint not found: ${req.method} ${req.originalUrl}`
    });
};

// Global Error Handler
const errorHandler = (err, req, res, next) => {
    let statusCode = err.status || err.statusCode || (res.statusCode && res.statusCode !== 200 ? res.statusCode : 500);
    let message = err.message || 'An unexpected internal server error occurred';

    // JWT Errors
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid authentication token';
    }
    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Authentication token expired';
    }

    // Multer File Upload Errors (e.g. file size limit exceeded)
    if (err.name === 'MulterError') {
        statusCode = 400;
        if (err.code === 'LIMIT_FILE_SIZE') {
            message = 'File size exceeds maximum allowed limit of 25MB';
        } else {
            message = `File upload error: ${err.message}`;
        }
    }

    // Safe error log on server (sanitized)
    if (statusCode === 500) {
        console.error('[Server Error]', err.name, ':', err.message);
    }

    res.status(statusCode).json({
        success: false,
        message: message
    });
};

module.exports = {
    notFoundHandler,
    errorHandler
};
