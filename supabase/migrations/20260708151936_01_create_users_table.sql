CREATE TABLE users (
  id_user UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(100) NOT NULL UNIQUE,
  role VARCHAR(20) CHECK (role IN ('pasien', 'nakes', 'admin')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pengguna dapat melihat profil mereka sendiri" ON users
  FOR SELECT TO authenticated USING (auth.uid() = id_user);