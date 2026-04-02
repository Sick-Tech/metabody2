const { Pool } = require('pg');

const pool = new Pool({
  host:     process.env.DB_HOST,
  port:     parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: true, ca: process.env.RDS_CA_CERT }
    : { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
});

async function connectDB() {
  try {
    const client = await pool.connect();
    console.log('[DB] Conectado ao PostgreSQL (AWS RDS)');
    client.release();
  } catch (err) {
    console.error('[DB] Falha na conexão:', err.message);
    process.exit(1);
  }
}

// Helper para queries
const query = (text, params) => pool.query(text, params);

module.exports = { pool, query, connectDB };
