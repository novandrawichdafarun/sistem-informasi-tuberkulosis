CREATE TABLE laporan_makan (
  id_laporan SERIAL PRIMARY KEY,
  id_pasien INTEGER REFERENCES pasien(id_pasien) ON DELETE CASCADE NOT NULL,
  waktu_makan TIMESTAMP WITH TIME ZONE NOT NULL, -- Jam berapa pasien makan
  karbo VARCHAR(50) NOT NULL,
  protein VARCHAR(50) NOT NULL,
  serat VARCHAR(50) NOT NULL,
  catatan TEXT, -- Opsional, misal: "Makan bubur ayam"
  reported_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX idx_laporan_makan_pasien ON laporan_makan(id_pasien);
CREATE INDEX idx_laporan_makan_waktu ON laporan_makan(waktu_makan);

-- Aktifkan RLS
ALTER TABLE laporan_makan ENABLE ROW LEVEL SECURITY;

-- Policy agar pasien hanya bisa melihat dan menambah data makannya sendiri
CREATE POLICY "Pasien kelola laporan makan sendiri" ON laporan_makan
  FOR ALL TO authenticated USING (
    id_pasien IN (
      SELECT id_pasien FROM pasien WHERE id_user = auth.uid()
    )
  );