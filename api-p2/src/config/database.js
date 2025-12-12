require('dotenv').config();
const { Pool } = require('pg');

// Configuração do pool de conexões PostgreSQL
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'api_p2',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    max: 10, // máximo de conexões no pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Testar conexão
pool.connect((err, client, release) => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
        console.log('💡 Make sure to configure your .env file with database credentials');
    } else {
        console.log('✅ Database connected successfully');
        release();
    }
});

// Função para criar tabela de usuários se não existir
const initDatabase = async () => {
    try {
        const createTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

        await pool.query(createTableQuery);
        console.log('✅ Users table ready');
    } catch (error) {
        console.error('❌ Error initializing database:', error.message);
    }
};

// Inicializar banco ao carregar o módulo
initDatabase();

// Wrapper para manter compatibilidade com código MySQL
const query = async (text, params) => {
    const result = await pool.query(text, params);
    return result.rows;
};

module.exports = {
    query,
    pool
};
