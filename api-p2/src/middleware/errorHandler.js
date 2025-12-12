// src/middleware/errorHandler.js - Middleware centralizado de tratamento de erros

const logger = require('../config/logger');

// Middleware de tratamento de erros
const errorHandler = (err, req, res, next) => {
    // Gerar ID único para a requisição
    const requestId = req.id || Date.now().toString(36);

    // Logar erro completo
    logger.error('Error occurred', {
        requestId,
        error: {
            message: err.message,
            stack: err.stack,
            name: err.name
        },
        request: {
            method: req.method,
            url: req.url,
            ip: req.ip,
            userAgent: req.get('user-agent')
        }
    });

    // Determinar status code
    const statusCode = err.statusCode || err.status || 500;

    // Resposta de erro (não expor detalhes em produção)
    const errorResponse = {
        error: {
            message: process.env.NODE_ENV === 'production'
                ? 'Internal Server Error'
                : err.message,
            status: statusCode,
            timestamp: new Date().toISOString(),
            requestId
        }
    };

    // Incluir stack trace apenas em desenvolvimento
    if (process.env.NODE_ENV !== 'production') {
        errorResponse.error.stack = err.stack;
    }

    res.status(statusCode).json(errorResponse);
};

// Middleware para capturar erros assíncronos
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = { errorHandler, asyncHandler };
