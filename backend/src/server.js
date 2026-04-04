require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const app    = require('./app');
const { connectDB, query } = require('./config/database');

const PORT = process.env.PORT || 3001;

async function runMigrations() {
  // Garante tabelas criadas após deploys incrementais
  await query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

  await query(`
    CREATE TABLE IF NOT EXISTS module_videos (
      id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
      module_id    UUID        NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
      title        TEXT        NOT NULL DEFAULT '',
      s3_key       TEXT,
      duration_min INT,
      order_num    INT         NOT NULL DEFAULT 0,
      created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  // Adiciona thumbnail_url aos módulos se ainda não existir
  await query(`ALTER TABLE modules ADD COLUMN IF NOT EXISTS thumbnail_url TEXT`);

  console.log('[DB] Migrações aplicadas.');
}

async function start() {
  await connectDB();
  await runMigrations();
  app.listen(PORT, () => {
    console.log(`[MetaBody API] Rodando na porta ${PORT} — ${process.env.NODE_ENV || 'development'}`);
  });
}

start();
