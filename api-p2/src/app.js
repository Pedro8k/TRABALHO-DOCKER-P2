// src/app.js - Aplicação Express com vulnerabilidades intencionais para SAST

const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const crypto = require('crypto');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

// Middlewares de logging e monitoramento
const logger = require('./config/logger');
const httpLogger = require('./middleware/logging');
const { errorHandler } = require('./middleware/errorHandler');
const { metricsMiddleware, getMetrics } = require('./middleware/metrics');
const healthRouter = require('./routes/health');

const app = express();

// Configurar CORS (permitir todas as origens para desenvolvimento/demonstração)
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middlewares de logging e métricas (antes das rotas)
app.use(httpLogger);
app.use(metricsMiddleware);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuração do Swagger
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Vulnerable API - SAST Demo',
            version: '1.0.0',
            description: 'API vulnerável para demonstração de ferramentas SAST. **NÃO USE EM PRODUÇÃO!**',
            contact: {
                name: 'Security Testing Team',
                email: 'security@example.com'
            }
        },
        servers: [
            {
                url: process.env.NODE_ENV === 'production'
                    ? 'https://api-p2-latest.onrender.com'
                    : 'http://localhost:3000',
                description: process.env.NODE_ENV === 'production'
                    ? 'Production server (Render)'
                    : 'Development server'
            }
        ],
        tags: [
            {
                name: 'Users',
                description: 'CRUD de usuários (funcional com PostgreSQL)'
            },
            {
                name: 'SQL Injection',
                description: 'Endpoints vulneráveis a SQL Injection'
            },
            {
                name: 'Command Injection',
                description: 'Endpoints vulneráveis a Command Injection'
            },
            {
                name: 'XSS',
                description: 'Endpoints vulneráveis a Cross-Site Scripting'
            },
            {
                name: 'SSRF',
                description: 'Endpoints vulneráveis a Server-Side Request Forgery'
            },
            {
                name: 'Code Injection',
                description: 'Endpoints vulneráveis a Code Injection'
            },
            {
                name: 'File Operations',
                description: 'Endpoints com vulnerabilidades em operações de arquivo'
            },
            {
                name: 'Cryptography',
                description: 'Endpoints com criptografia fraca'
            },
            {
                name: 'Other',
                description: 'Outras vulnerabilidades'
            }
        ]
    },
    apis: ['./src/app.js', './src/routes/*.js']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// VULNERABILIDADE 1: Credenciais hardcoded
const DB_PASSWORD = 'SuperSecret123!';
const API_KEY = 'sk_live_51234567890abcdef';
const JWT_SECRET = 'my-secret-key';

// VULNERABILIDADE 2: Conexão MySQL sem validação
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: DB_PASSWORD,
    database: 'vulnerable_db'
});

// Importar rotas do CRUD funcional
const usersRoutes = require('./routes/users');
app.use('/api/users', usersRoutes);

// VULNERABILIDADE 3: SQL Injection
/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Buscar usuário por ID (Vulnerável a SQL Injection)
 *     tags: [SQL Injection]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do usuário (vulnerável a SQL injection)
 *         example: "1 OR 1=1"
 *     responses:
 *       200:
 *         description: Lista de usuários
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       500:
 *         description: Erro no servidor
 */
app.get('/users/:id', (req, res) => {
    const userId = req.params.id;
    const query = `SELECT * FROM users WHERE id = ${userId}`;

    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// VULNERABILIDADE 4: Command Injection
/**
 * @swagger
 * /execute:
 *   post:
 *     summary: Executar comando (Vulnerável a Command Injection)
 *     tags: [Command Injection]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               command:
 *                 type: string
 *                 description: Comando a ser executado
 *                 example: "; cat /etc/passwd"
 *     responses:
 *       200:
 *         description: Resultado do comando
 *       500:
 *         description: Erro na execução
 */
app.post('/execute', (req, res) => {
    const command = req.body.command;
    exec(`ls ${command}`, (error, stdout, stderr) => {
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        res.json({ output: stdout });
    });
});
 
// VULNERABILIDADE 5: Path Traversal
/**
 * @swagger
 * /download:
 *   get:
 *     summary: Download de arquivo (Vulnerável a Path Traversal)
 *     tags: [File Operations]
 *     parameters:
 *       - in: query
 *         name: file
 *         required: true
 *         schema:
 *           type: string
 *         description: Nome do arquivo
 *         example: "../../etc/passwd"
 *     responses:
 *       200:
 *         description: Arquivo encontrado
 *       404:
 *         description: Arquivo não encontrado
 */
app.get('/download', (req, res) => {
    const filename = req.query.file;
    const filepath = path.join(__dirname, 'files', filename);

    res.sendFile(filepath);
});

// VULNERABILIDADE 6: XSS através de template sem sanitização
/**
 * @swagger
 * /search:
 *   get:
 *     summary: Buscar conteúdo (Vulnerável a XSS)
 *     tags: [XSS]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Termo de busca
 *         example: "<script>alert('XSS')</script>"
 *     responses:
 *       200:
 *         description: Resultado da busca
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 */
app.get('/search', (req, res) => {
    const searchTerm = req.query.q;
    const html = `
    <html>
      <body>
        <h1>Resultados para: ${searchTerm}</h1>
      </body>
    </html>
  `;
    res.send(html);
});

// VULNERABILIDADE 7: Weak Cryptography
/**
 * @swagger
 * /encrypt:
 *   post:
 *     summary: Criptografar dados (Usa algoritmo fraco e chave hardcoded)
 *     tags: [Cryptography]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               data:
 *                 type: string
 *                 description: Dados para criptografar
 *                 example: "senha123"
 *     responses:
 *       200:
 *         description: Dados criptografados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 encrypted:
 *                   type: string
 */
app.post('/encrypt', (req, res) => {
    const data = req.body.data;
    // Vulnerabilidade: MD5 é fraco, chave hardcoded, sem salt
    const weakKey = 'weak-key-12345';
    const encrypted = crypto.createHash('md5').update(data + weakKey).digest('hex');
    res.json({ encrypted, algorithm: 'md5', key: weakKey });
});

/**
 * @swagger
 * /:
 *   get:
 *     summary: Página inicial da API
 *     tags: [Other]
 *     responses:
 *       200:
 *         description: Mensagem de boas-vindas
 */
// Rotas de monitoramento
app.use(healthRouter);
app.get('/metrics', getMetrics);

app.get('/', (req, res) => {
    res.json({
        message: 'Vulnerable API - SAST Demo',
        documentation: '/api-docs',
        warning: '⚠️ Esta API contém vulnerabilidades intencionais. NÃO USE EM PRODUÇÃO!',
        crud: '/api/users (CRUD funcional com PostgreSQL)',
        monitoring: {
            health: '/health',
            metrics: '/metrics'
        }
    });
});

// Middleware de erro (deve ser o último)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
    logger.info(`API Documentation: http://localhost:${PORT}/api-docs`);
    logger.info(`Health Check: http://localhost:${PORT}/health`);
    logger.info(`Metrics: http://localhost:${PORT}/metrics`);
    console.log(`Server running on port ${PORT}`);
    console.log(`API Documentation: http://localhost:${PORT}/api-docs`);
    console.log(`API Key: ${API_KEY}`);
});

module.exports = app;
