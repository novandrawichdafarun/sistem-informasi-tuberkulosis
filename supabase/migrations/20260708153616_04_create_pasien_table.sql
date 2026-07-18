CREATE TABLE pasien (
  id_pasien SERIAL PRIMARY KEY,
  id_user UUID REFERENCES users(id_user) ON DELETE CASCADE NOT NULL,
  id_nakes INTEGER REFERENCES nakes(id_nakes) ON DELETE SET NULL,
  id_faskes INTEGER REFERENCES faskes(id_faskes) ON DELETE SET NULL,
  no_rm VARCHAR(50) UNIQUE, -- Nomor Rekam Medis
  nik CHAR(16) UNIQUE NOT NULL,
  nama_lengkap VARCHAR(100) NOT NULL,
  tanggal_lahir DATE NOT NULL,
  jenis_kelamin CHAR(1) CHECK (jenis_kelamin IN ('L', 'P')) NOT NULL,
  alamat TEXT,
  no_telp VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX idx_pasien_id_user ON pasien(id_user);
CREATE INDEX idx_pasien_id_nakes ON pasien(id_nakes);
CREATE INDEX idx_pasien_id_faskes ON pasien(id_faskes);
ALTER TABLE pasien ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pasien melihat data sendiri atau Nakes melihat data pasien binaannya" ON pasien
  FOR SELECT TO authenticated USING (
    auth.uid() = id_user OR 
    id_nakes IN (SELECT id_nakes FROM nakes WHERE id_user = auth.uid())
  );