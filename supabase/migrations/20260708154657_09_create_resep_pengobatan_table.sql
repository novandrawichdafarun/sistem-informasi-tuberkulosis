CREATE TABLE resep_pengobatan (
  id_resep SERIAL PRIMARY KEY,
  id_episode INTEGER REFERENCES episode_pengobatan(id_episode) ON DELETE CASCADE NOT NULL,
  id_nakes INTEGER REFERENCES nakes(id_nakes) ON DELETE SET NULL,
  tanggal_mulai_obat DATE NOT NULL,
  kategori_regimen VARCHAR(50) NOT NULL, -- Kategori 1 (HRZE), Kategori 2, Anak
  durasi_hari INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE resep_pengobatan ENABLE ROW LEVEL SECURITY;