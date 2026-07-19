CREATE TABLE pemeriksaan_lab (
  id_tes SERIAL PRIMARY KEY,
  id_episode INTEGER REFERENCES episode_pengobatan(id_episode) ON DELETE CASCADE NOT NULL,
  id_nakes INTEGER REFERENCES nakes(id_nakes) ON DELETE SET NULL,
  jenis_tes VARCHAR(50) NOT NULL, -- TCM, IGRA, Mantoux, BTA, Rontgen
  tanggal_tes DATE NOT NULL,
  periode_pemeriksaan VARCHAR(50) NOT NULL, -- Bulan ke-2, ke-5, akhir masa pengobatan

  -- Data Sample
  jenis_sample VARCHAR(50), -- Sputum (dahak), Cairan Serebrospinal (LCS), Jaringan (Biopsi), Bilasan Lambung
  kualitas_sample VARCHAR(50), -- Purulen / Mukoid / Saliva

  -- Hasil Tes Khusus Molekuler (TCM)
  dna_bakteri_tb VARCHAR(50) NOT NULL, -- Isi beban kuman khusus TCM: High, Medium, Low, Very Low, Trace
  status_resistensi VARCHAR(50) NOT NULL, -- Resisten / Sensitif / Indeterminate (Terutama untuk Rifampisin pada TCM atau obat lain)

  -- Hasil Tes Umum (Untuk Rontgen, Mantoux, IGRA)
  hasil_tes VARCHAR(100) NOT NULL, -- Hasil umum: Positif / Negatif / Normal / Kesan TB Paru Aktif

  -- Hasil Tes Mikroskopis (BTA)
  hasil_bta VARCHAR(100), -- Khusus tes BTA: Negatif / Scanty (tulis jumlahnya) / 1+ / 2+ / 3+
  
  catatan_lab text,
  berkas_pendukung_url VARCHAR(255), -- Link berkas di Supabase Storage
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX idx_pemeriksaan_lab_episode ON pemeriksaan_lab(id_episode);
ALTER TABLE pemeriksaan_lab ENABLE ROW LEVEL SECURITY;