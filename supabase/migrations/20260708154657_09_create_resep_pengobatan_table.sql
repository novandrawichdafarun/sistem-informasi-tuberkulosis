CREATE TABLE resep_pengobatan (
  id_resep SERIAL PRIMARY KEY,
  id_episode INTEGER REFERENCES episode_pengobatan(id_episode) ON DELETE CASCADE NOT NULL,
  id_nakes INTEGER REFERENCES nakes(id_nakes) ON DELETE SET NULL,
  tanggal_resep DATE NOT NULL,
  
  -- Klasifikasi Regimen
  kategori_regimen VARCHAR(50) NOT NULL, -- Kategori 1 (HRZE), Kategori 2, Anak
  fase_pengobatan VARCHAR(20), -- Intensif / Lanjutan

  -- Manajemen Waktu
  tanggal_mulai_obat DATE NOT NULL,
  durasi_hari INTEGER NOT NULL, -- Durasi resep berlaku, misal: 28 hari atau 56 hari
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX idx_resep_pengobatan_episode ON resep_pengobatan(id_episode);
ALTER TABLE resep_pengobatan ENABLE ROW LEVEL SECURITY;