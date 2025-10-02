const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    console.log('❌ Error:', err);

    if (err.code === 11000) {
        const message = 'Duplicate field value entered';
        error = { message, statusCode: 400 };
    }

    if (err.name === 'CastError') {
        const message = 'Resource not found';
        error = { message, statusCode: 404 };
    }

    res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Server Error'
    });
};

module.exports = errorHandler;