const bcrypt  = require('bcryptjs');
const crypto  = require('crypto');
const { validationResult } = require('express-validator');
const { query } = require('../config/database');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../middleware/auth.middleware');

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

// ── Cookie helpers ─────────────────────────────────────────────
function cookieOpts(maxAge) {
  const prod = process.env.NODE_ENV === 'production';
  return { httpOnly: true, sameSite: prod ? 'strict' : 'lax', secure: prod, path: '/', maxAge };
}
const ACCESS_MAX_AGE  = 15 * 60 * 1000;          // 15 min
const REFRESH_MAX_AGE = 30 * 24 * 60 * 60 * 1000; // 30 dias

function setAuthCookies(res, accessToken, refreshToken) {
  res.cookie('mb_access',  accessToken,  cookieOpts(ACCESS_MAX_AGE));
  res.cookie('mb_refresh', refreshToken, cookieOpts(REFRESH_MAX_AGE));
}

function clearAuthCookies(res) {
  res.clearCookie('mb_access',  { path: '/' });
  res.clearCookie('mb_refresh', { path: '/' });
}

// POST /api/v1/auth/login
exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password } = req.body;
  try {
    const { rows } = await query(
      `SELECT id, name, email, password_hash, role, avatar_url FROM users WHERE email = $1 AND role = 'student'`,
      [email.toLowerCase()]
    );
    const user = rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
    }

    const payload      = { id: user.id, role: user.role };
    const accessToken  = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    await query(
      `UPDATE users SET refresh_token = $1, last_login = NOW() WHERE id = $2`,
      [hashToken(refreshToken), user.id]
    );

    setAuthCookies(res, accessToken, refreshToken);
    res.json({ user: { id: user.id, name: user.name, email: user.email, avatarUrl: user.avatar_url } });
  } catch (err) {
    res.status(500).json({ error: 'Erro interno.' });
  }
};

// POST /api/v1/auth/admin/login
exports.adminLogin = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password } = req.body;
  try {
    const { rows } = await query(
      `SELECT id, name, email, password_hash, role FROM users WHERE email = $1 AND role = 'admin'`,
      [email.toLowerCase()]
    );
    const user = rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    const payload      = { id: user.id, role: user.role };
    const accessToken  = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    await query(`UPDATE users SET refresh_token = $1, last_login = NOW() WHERE id = $2`, [hashToken(refreshToken), user.id]);

    setAuthCookies(res, accessToken, refreshToken);
    res.json({ user: { id: user.id, name: user.name, role: user.role }, accessToken });
  } catch {
    res.status(500).json({ error: 'Erro interno.' });
  }
};

// POST /api/v1/auth/logout
exports.logout = async (req, res) => {
  try {
    await query(`UPDATE users SET refresh_token = NULL WHERE id = $1`, [req.user.id]);
  } catch { /* silent — cookie é limpo mesmo se DB falhar */ }
  clearAuthCookies(res);
  res.json({ message: 'Sessão encerrada.' });
};

// POST /api/v1/auth/refresh
exports.refresh = async (req, res) => {
  const refreshToken = req.cookies?.mb_refresh;
  if (!refreshToken) return res.status(400).json({ error: 'Refresh token obrigatório.' });
  try {
    const payload = verifyRefreshToken(refreshToken);
    const { rows } = await query(`SELECT id, role, refresh_token FROM users WHERE id = $1`, [payload.id]);
    const user = rows[0];
    if (!user || user.refresh_token !== hashToken(refreshToken)) {
      clearAuthCookies(res);
      return res.status(401).json({ error: 'Refresh token inválido.' });
    }
    const newAccess  = signAccessToken({ id: user.id, role: user.role });
    const newRefresh = signRefreshToken({ id: user.id, role: user.role });
    await query(`UPDATE users SET refresh_token = $1 WHERE id = $2`, [hashToken(newRefresh), user.id]);
    setAuthCookies(res, newAccess, newRefresh);
    res.json({ message: 'Token renovado.' });
  } catch {
    clearAuthCookies(res);
    res.status(401).json({ error: 'Refresh token expirado.' });
  }
};

// POST /api/v1/auth/forgot-password
exports.forgotPassword = async (_req, res) => {
  res.status(503).json({ error: 'Funcionalidade em desenvolvimento.' });
};

// POST /api/v1/auth/reset-password
exports.resetPassword = async (_req, res) => {
  res.status(503).json({ error: 'Funcionalidade em desenvolvimento.' });
};

// POST /api/v1/auth/admin/login
exports.adminLogin = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password } = req.body;
  try {
    const { rows } = await query(
      `SELECT id, name, email, password_hash, role FROM users WHERE email = $1 AND role = 'admin'`,
      [email.toLowerCase()]
    );
    const user = rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    const payload      = { id: user.id, role: user.role };
    const accessToken  = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    await query(`UPDATE users SET refresh_token = $1, last_login = NOW() WHERE id = $2`, [hashToken(refreshToken), user.id]);

    res.json({ accessToken, refreshToken, user: { id: user.id, name: user.name, role: 'admin' } });
  } catch {
    res.status(500).json({ error: 'Erro interno.' });
  }
};

// POST /api/v1/auth/logout
exports.logout = async (req, res) => {
  await query(`UPDATE users SET refresh_token = NULL WHERE id = $1`, [req.user.id]);
  res.json({ message: 'Sessão encerrada.' });
};

// POST /api/v1/auth/refresh
exports.refresh = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ error: 'Refresh token obrigatório.' });
  try {
    const payload = verifyRefreshToken(refreshToken);
    const { rows } = await query(`SELECT id, role, refresh_token FROM users WHERE id = $1`, [payload.id]);
    const user = rows[0];
    if (!user || user.refresh_token !== hashToken(refreshToken)) {
      return res.status(401).json({ error: 'Refresh token inválido.' });
    }
    const newAccess  = signAccessToken({ id: user.id, role: user.role });
    const newRefresh = signRefreshToken({ id: user.id, role: user.role });
    await query(`UPDATE users SET refresh_token = $1 WHERE id = $2`, [hashToken(newRefresh), user.id]);
    res.json({ accessToken: newAccess, refreshToken: newRefresh });
  } catch {
    res.status(401).json({ error: 'Refresh token expirado.' });
  }
};

// POST /api/v1/auth/forgot-password
exports.forgotPassword = async (_req, res) => {
  res.status(503).json({ error: 'Funcionalidade em desenvolvimento.' });
};

// POST /api/v1/auth/reset-password
exports.resetPassword = async (_req, res) => {
  res.status(503).json({ error: 'Funcionalidade em desenvolvimento.' });
};
