const express = require('express');
const router = express.Router();
const { exec } = require('child_process');
const xml2js = require('xml2js');

/**
 * @swagger
 * /api/vulnerable/sql-injection:
 *   post:
 *     summary: Endpoint vulnerável a SQL Injection (DEMO)
 *     tags: [Vulnerabilities]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *     responses:
 *       200:
 *         description: Query executada (vulnerável)
 */
router.post('/sql-injection', (req, res) => {
    const { username } = req.body;

    // VULNERABILIDADE: SQL Injection
    // Concatenação direta de input do usuário na query
    const query = `SELECT * FROM users WHERE username = '${username}'`;

    res.json({
        message: 'SQL Injection vulnerability detected by SAST',
        query: query,
        warning: 'This endpoint is intentionally vulnerable for SAST testing'
    });
});

/**
 * @swagger
 * /api/vulnerable/command-injection:
 *   post:
 *     summary: Endpoint vulnerável a Command Injection (DEMO)
 *     tags: [Vulnerabilities]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               filename:
 *                 type: string
 *     responses:
 *       200:
 *         description: Comando executado (vulnerável)
 */
router.post('/command-injection', (req, res) => {
    const { filename } = req.body;

    // VULNERABILIDADE: Command Injection
    // Execução de comando com input do usuário sem sanitização
    exec(`cat ${filename}`, (error, stdout, stderr) => {
        res.json({
            message: 'Command Injection vulnerability detected by SAST',
            command: `cat ${filename}`,
            warning: 'This endpoint is intentionally vulnerable for SAST testing'
        });
    });
});

/**
 * @swagger
 * /api/vulnerable/xxe:
 *   post:
 *     summary: Endpoint vulnerável a XXE (XML External Entity) (DEMO)
 *     tags: [Vulnerabilities]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               xml:
 *                 type: string
 *     responses:
 *       200:
 *         description: XML processado (vulnerável)
 */
router.post('/xxe', (req, res) => {
    const { xml } = req.body;

    // VULNERABILIDADE: XXE (XML External Entity)
    // Parser XML sem proteção contra entidades externas
    const parser = new xml2js.Parser({
        // Configuração insegura - permite entidades externas
        explicitCharkey: true
    });

    parser.parseString(xml, (err, result) => {
        res.json({
            message: 'XXE vulnerability detected by SAST',
            warning: 'This endpoint is intentionally vulnerable for SAST testing',
            parsed: result
        });
    });
});

/**
 * @swagger
 * /api/vulnerable/path-traversal:
 *   get:
 *     summary: Endpoint vulnerável a Path Traversal (DEMO)
 *     tags: [Vulnerabilities]
 *     parameters:
 *       - in: query
 *         name: file
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Arquivo acessado (vulnerável)
 */
router.get('/path-traversal', (req, res) => {
    const { file } = req.query;

    // VULNERABILIDADE: Path Traversal
    // Acesso a arquivos sem validação do caminho
    const filePath = `./uploads/${file}`;

    res.json({
        message: 'Path Traversal vulnerability detected by SAST',
        path: filePath,
        warning: 'This endpoint is intentionally vulnerable for SAST testing'
    });
});

/**
 * @swagger
 * /api/vulnerable/hardcoded-credentials:
 *   get:
 *     summary: Endpoint com credenciais hardcoded (DEMO)
 *     tags: [Vulnerabilities]
 *     responses:
 *       200:
 *         description: Credenciais expostas (vulnerável)
 */
router.get('/hardcoded-credentials', (req, res) => {
    // VULNERABILIDADE: Hardcoded Credentials
    const apiKey = 'sk-1234567890abcdef';
    const password = 'admin123';
    const dbConnection = 'mongodb://admin:password123@localhost:27017';

    res.json({
        message: 'Hardcoded Credentials vulnerability detected by SAST',
        warning: 'This endpoint is intentionally vulnerable for SAST testing',
        note: 'Credentials should be in environment variables'
    });
});

/**
 * @swagger
 * /api/vulnerable/weak-crypto:
 *   post:
 *     summary: Endpoint com criptografia fraca (DEMO)
 *     tags: [Vulnerabilities]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               data:
 *                 type: string
 *     responses:
 *       200:
 *         description: Dados criptografados com algoritmo fraco (vulnerável)
 */
router.post('/weak-crypto', (req, res) => {
    const crypto = require('crypto');
    const { data } = req.body;

    // VULNERABILIDADE: Weak Cryptography
    // Uso de MD5 (algoritmo fraco e quebrado)
    const hash = crypto.createHash('md5').update(data).digest('hex');

    res.json({
        message: 'Weak Cryptography vulnerability detected by SAST',
        algorithm: 'MD5',
        hash: hash,
        warning: 'This endpoint is intentionally vulnerable for SAST testing'
    });
});

module.exports = router;
