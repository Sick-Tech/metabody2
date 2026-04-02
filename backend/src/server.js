require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const app    = require('./app');
const { connectDB } = require('./config/database');

const PORT = process.env.PORT || 3001;

async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`[MetaBody API] Rodando na porta ${PORT} — ${process.env.NODE_ENV || 'development'}`);
  });
}

start();
