-- ============================================================
-- MetaBody Club — Schema PostgreSQL (AWS RDS)
-- Executar no banco de dados antes de rodar o backend
-- ============================================================

-- Extensão para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── USERS (alunos + admins) ──────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT        NOT NULL,
  email           TEXT        UNIQUE NOT NULL,
  password_hash   TEXT        NOT NULL,
  role            TEXT        NOT NULL DEFAULT 'student' CHECK (role IN ('student','admin')),
  avatar_url      TEXT,
  refresh_token   TEXT,
  reset_token     TEXT,
  reset_token_exp TIMESTAMPTZ,
  last_login      TIMESTAMPTZ,
  email_verified  BOOLEAN     NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── PLANS (trimestral / semestral / anual) ───────────────────
CREATE TABLE IF NOT EXISTS plans (
  id         UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT    NOT NULL UNIQUE,
  period     TEXT    NOT NULL CHECK (period IN ('quarterly','semiannual','annual')),
  price      NUMERIC(10,2) NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO plans (name, period, price) VALUES
  ('Pro Trimestral', 'quarterly',   229.90),
  ('Pro Semestral',  'semiannual',  199.90),
  ('Pro Anual',      'annual',      179.90)
ON CONFLICT (name) DO UPDATE SET price = EXCLUDED.price, period = EXCLUDED.period;

-- ── SUBSCRIPTIONS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subscriptions (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id     UUID        NOT NULL REFERENCES plans(id),
  price_paid  NUMERIC(10,2),
  starts_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at  TIMESTAMPTZ NOT NULL,
  status      TEXT        NOT NULL DEFAULT 'active' CHECK (status IN ('active','expired','cancelled')),
  gateway_ref TEXT,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── TRAILS (Trilhas) ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS trails (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT        NOT NULL,
  description   TEXT,
  thumbnail_url TEXT,
  published     BOOLEAN     NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── MODULES (Aulas dentro das trilhas) ──────────────────────
CREATE TABLE IF NOT EXISTS modules (
  id            UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
  trail_id      UUID    NOT NULL REFERENCES trails(id) ON DELETE CASCADE,
  title         TEXT    NOT NULL,
  description   TEXT,
  duration_min  INT,
  order_num     INT     NOT NULL DEFAULT 0,
  video_s3_key  TEXT,   -- chave S3 privada (nunca expor ao cliente)
  published     BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (trail_id, order_num)
);

-- ── MODULE_VIDEOS (vídeos individuais dentro de um módulo) ──
CREATE TABLE IF NOT EXISTS module_videos (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id    UUID        NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  title        TEXT        NOT NULL DEFAULT '',
  s3_key       TEXT,
  duration_min INT,
  order_num    INT         NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── MODULE_PROGRESS ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS module_progress (
  user_id    UUID    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  module_id  UUID    NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  completed  BOOLEAN NOT NULL DEFAULT false,
  watched_at TIMESTAMPTZ,
  PRIMARY KEY (user_id, module_id)
);

-- View auxiliar para calcular % por trilha por aluno
CREATE OR REPLACE VIEW progress_summary AS
SELECT mp.user_id,
       m.trail_id,
       ROUND(COUNT(*) FILTER (WHERE mp.completed)::numeric / NULLIF(COUNT(*),0) * 100) percent
FROM module_progress mp
JOIN modules m ON m.id = mp.module_id
GROUP BY mp.user_id, m.trail_id;

-- ── LIVES ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lives (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  title         TEXT        NOT NULL,
  description   TEXT,
  scheduled_at  TIMESTAMPTZ NOT NULL,
  duration_min  INT,
  instructor    TEXT        NOT NULL,
  status        TEXT        NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming','live','done','cancelled')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── PARTNERS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS partners (
  id          UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT    NOT NULL,
  category    TEXT    NOT NULL,
  discount    TEXT    NOT NULL,
  logo_url    TEXT,
  description TEXT,
  coupon_url  TEXT,
  active      BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── ACTIVITY_LOG ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS activity_log (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID        REFERENCES users(id) ON DELETE SET NULL,
  type        TEXT        NOT NULL,
  description TEXT        NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── ÍNDICES ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_subscriptions_user     ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_modules_trail          ON modules(trail_id);
CREATE INDEX IF NOT EXISTS idx_progress_user          ON module_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_users_email            ON users(email);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status   ON subscriptions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_activity_user          ON activity_log(user_id);

-- ── AUTO-UPDATE updated_at ────────────────────────────────────
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_users_updated_at         BEFORE UPDATE ON users         FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE OR REPLACE TRIGGER trg_plans_updated_at         BEFORE UPDATE ON plans         FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE OR REPLACE TRIGGER trg_trails_updated_at        BEFORE UPDATE ON trails        FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE OR REPLACE TRIGGER trg_modules_updated_at       BEFORE UPDATE ON modules       FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE OR REPLACE TRIGGER trg_partners_updated_at      BEFORE UPDATE ON partners      FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE OR REPLACE TRIGGER trg_lives_updated_at         BEFORE UPDATE ON lives         FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE OR REPLACE TRIGGER trg_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
