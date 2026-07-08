CREATE TABLE users (
  id_user UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) CHECK (role IN ('pasien', 'nakes', 'admin')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pengguna dapat melihat profil mereka sendiri" ON users
  FOR SELECT USING (
      current_setting('request.jwt.claims', true)::json->>'sub' = id_user::text 
      OR 
      current_setting('my.custom.user_id', true) = id_user::text
    );