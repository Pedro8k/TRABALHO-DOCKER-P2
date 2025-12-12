// src/middleware/logging.js - Middleware de logging HTTP com Morgan

const morgan = require('morgan');
const logger = require('../config/logger');

// Formato customizado para Morgan
morgan.token('body', (req) => {
    // Não logar senhas ou dados sensíveis
    if (req.body && req.body.password) {
        return JSON.stringify({ ...req.body, password: '***' });
    }
    return JSON.stringify(req.body);
});

// Formato de log HTTP
const httpLogFormat = ':method :url :status :response-time ms - :body';

// Middleware de logging
const httpLogger = morgan(httpLogFormat, {
    stream: logger.stream,
    skip: (req) => {
        // Não logar health checks em produção
        return process.env.NODE_ENV === 'production' && req.url === '/health';
    }
});

module.exports = httpLogger;
