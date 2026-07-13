CREATE TABLE nakes (
  id_nakes SERIAL PRIMARY KEY,
  id_user UUID REFERENCES users(id_user) ON DELETE CASCADE NOT NULL,
  id_faskes INTEGER REFERENCES faskes(id_faskes) ON DELETE SET NULL,
  nama VARCHAR(100) NOT NULL,
  no_str_sip VARCHAR(50) UNIQUE,
  jabatan VARCHAR(50),
  no_hp VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX idx_nakes_id_user ON nakes(id_user);
create INDEX idx_nakes_id_faskes ON nakes(id_faskes);
ALTER TABLE nakes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Nakes bisa melihat profil nakes lain se-faskes" ON nakes
  FOR SELECT TO authenticated USING (true);