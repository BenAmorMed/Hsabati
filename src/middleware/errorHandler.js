/**
 * Global error-handling middleware.
 * Express recognises this as an error handler because it has 4 params.
 */
const errorHandler = (err, _req, res, _next) => {
    console.error(err.stack);

    const status = err.statusCode || 500;
    res.status(status).json({
        message: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};

module.exports = errorHandler;
