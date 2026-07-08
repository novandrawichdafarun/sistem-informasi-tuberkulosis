CREATE TABLE faskes (
  id_faskes SERIAL PRIMARY KEY,
  nama_faskes VARCHAR(100) NOT NULL,
  jenis VARCHAR(50) NOT NULL, -- Puskesmas, Rumah Sakit, Klinik
  alamat TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE faskes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pengguna terautentikasi dapat melihat faskes" ON faskes
  FOR SELECT TO authenticated USING (true);