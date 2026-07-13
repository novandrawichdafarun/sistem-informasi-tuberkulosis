CREATE TABLE users (
  id_user UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) CHECK (role IN ('pasien', 'nakes', 'super_admin')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pengguna dapat melihat profil mereka sendiri" ON users
  FOR SELECT USING (
      current_setting('request.jwt.claims', true)::json->>'sub' = id_user::text 
      OR 
      current_setting('my.custom.user_id', true) = id_user::text
    );

CREATE TABLE password_resets (
  id SERIAL PRIMARY KEY,
  email VARCHAR(100) NOT NULL,
  token VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_password_resets_email ON password_resets(email);
ALTER TABLE password_resets ENABLE ROW LEVEL SECURITY;

CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_user UUID REFERENCES users(id_user) ON DELETE CASCADE,
  session_token TEXT UNIQUE NOT NULL, 
  device_info TEXT, 
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_user_sessions_user ON user_sessions(id_user);
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;