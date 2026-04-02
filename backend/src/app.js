const express      = require('express');
const helmet       = require('helmet');
const cors         = require('cors');
const morgan       = require('morgan');
const rateLimit    = require('express-rate-limit');
const cookieParser = require('cookie-parser');

// ── Routes ──────────────────────────────────────────────────────
const authRoutes      = require('./routes/auth.routes');
const userRoutes      = require('./routes/user.routes');
const adminRoutes     = require('./routes/admin.routes');
const trailRoutes     = require('./routes/trail.routes');
const liveRoutes      = require('./routes/live.routes');
const partnerRoutes   = require('./routes/partner.routes');
const planRoutes      = require('./routes/plan.routes');
const mediaRoutes     = require('./routes/media.routes');
const progressRoutes  = require('./routes/progress.routes');

const app = express();

// ── Security Middleware ─────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(cookieParser());

// ── Rate Limiting ───────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // login attempts
  message: { error: 'Muitas tentativas. Aguarde 15 minutos.' },
});

app.use(globalLimiter);
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10kb' }));

// ── Health check ───────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));

// ── API Routes v1 ───────────────────────────────────────────────
app.use('/api/v1/auth',     authLimiter, authRoutes);
app.use('/api/v1/users',    userRoutes);
app.use('/api/v1/admin',    adminRoutes);
app.use('/api/v1/trails',   trailRoutes);
app.use('/api/v1/lives',    liveRoutes);
app.use('/api/v1/partners', partnerRoutes);
app.use('/api/v1/plans',    planRoutes);
app.use('/api/v1/media',    mediaRoutes);
app.use('/api/v1/progress', progressRoutes);

// ── 404 Handler ─────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Rota não encontrada.' });
});

// ── Global Error Handler ────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Erro interno do servidor.' });
});

module.exports = app;
