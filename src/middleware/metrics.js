// src/middleware/metrics.js - Middleware para coletar métricas de performance

const logger = require('../config/logger');

// Armazenar métricas em memória (resetado a cada deploy)
const metrics = {
    requests: {
        total: 0,
        byMethod: {},
        byStatus: {},
        byEndpoint: {}
    },
    performance: {
        slowest: [],
        average: 0
    },
    errors: {
        total: 0,
        byType: {}
    }
};

// Middleware de métricas
const metricsMiddleware = (req, res, next) => {
    const startTime = Date.now();

    // Capturar quando a resposta terminar
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        const method = req.method;
        const status = res.statusCode;
        const endpoint = req.route ? req.route.path : req.path;

        // Incrementar contadores
        metrics.requests.total++;
        metrics.requests.byMethod[method] = (metrics.requests.byMethod[method] || 0) + 1;
        metrics.requests.byStatus[status] = (metrics.requests.byStatus[status] || 0) + 1;
        metrics.requests.byEndpoint[endpoint] = (metrics.requests.byEndpoint[endpoint] || 0) + 1;

        // Rastrear erros
        if (status >= 400) {
            metrics.errors.total++;
            const errorType = status >= 500 ? 'server' : 'client';
            metrics.errors.byType[errorType] = (metrics.errors.byType[errorType] || 0) + 1;
        }

        // Rastrear performance
        if (duration > 1000) {
            // Logar requisições lentas (> 1s)
            logger.warn('Slow request detected', {
                method,
                endpoint,
                duration: `${duration}ms`,
                status
            });

            // Adicionar aos mais lentos (manter top 10)
            metrics.performance.slowest.push({
                method,
                endpoint,
                duration,
                timestamp: new Date().toISOString()
            });
            metrics.performance.slowest.sort((a, b) => b.duration - a.duration);
            metrics.performance.slowest = metrics.performance.slowest.slice(0, 10);
        }

        // Calcular média de tempo de resposta
        const totalDuration = metrics.performance.average * (metrics.requests.total - 1) + duration;
        metrics.performance.average = Math.round(totalDuration / metrics.requests.total);
    });

    next();
};

// Endpoint para visualizar métricas
const getMetrics = (req, res) => {
    res.json({
        ...metrics,
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
};

// Resetar métricas
const resetMetrics = () => {
    metrics.requests = { total: 0, byMethod: {}, byStatus: {}, byEndpoint: {} };
    metrics.performance = { slowest: [], average: 0 };
    metrics.errors = { total: 0, byType: {} };
    logger.info('Metrics reset');
};

module.exports = { metricsMiddleware, getMetrics, resetMetrics, metrics };
