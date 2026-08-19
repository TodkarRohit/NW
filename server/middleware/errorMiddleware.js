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
    let statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
    let message = err.message || 'An unexpected internal server error occurred';

    // Mongoose Duplicate Key Error (code 11000) - e.g. duplicate username
    if (err.code === 11000) {
        statusCode = 409;
        const field = Object.keys(err.keyValue || {})[0] || 'field';
        message = `A user with this ${field} already exists. Please choose a different ${field}.`;
    }

    // Mongoose Validation Error
    if (err.name === 'ValidationError') {
        statusCode = 400;
        const firstError = Object.values(err.errors)[0];
        message = firstError ? firstError.message : 'Invalid request validation data';
    }

    // Mongoose CastError (e.g. invalid ObjectId format)
    if (err.name === 'CastError') {
        statusCode = 400;
        message = `Invalid resource identifier format: ${err.value}`;
    }

    // JWT Errors
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid authentication token';
    }
    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Authentication token expired';
    }

    // Mongoose / MongoDB Connection Error
    if (err.name === 'MongooseError' || (err.message && err.message.includes('buffering timed out')) || err.name === 'MongoServerSelectionError' || err.name === 'MongoNetworkError') {
        statusCode = 503;
        message = 'Database service is currently unavailable. Please ensure MongoDB is running or configure MONGO_URI in server/.env.';
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
