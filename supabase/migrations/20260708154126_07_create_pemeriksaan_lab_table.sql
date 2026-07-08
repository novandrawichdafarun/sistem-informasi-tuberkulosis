CREATE TABLE pemeriksaan_lab (
  id_tes SERIAL PRIMARY KEY,
  id_episode INTEGER REFERENCES episode_pengobatan(id_episode) ON DELETE CASCADE NOT NULL,
  id_nakes INTEGER REFERENCES nakes(id_nakes) ON DELETE SET NULL,
  jenis_tes VARCHAR(50) NOT NULL, -- TCM, IGRA, Mantoux, BTA, Rontgen
  tanggal_tes DATE NOT NULL,
  hasil_tes VARCHAR(100) NOT NULL, -- Positif, Negatif, dll
  tahap_tes VARCHAR(50), -- Akhir Bulan ke-2, ke-5, ke-6
  berkas_pendukung_url VARCHAR(255), -- Link berkas di Supabase Storage
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE pemeriksaan_lab ENABLE ROW LEVEL SECURITY;