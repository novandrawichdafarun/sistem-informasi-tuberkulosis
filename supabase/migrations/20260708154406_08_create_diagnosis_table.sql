CREATE TABLE diagnosis (
  id_diagnosis SERIAL PRIMARY KEY,
  id_episode INTEGER UNIQUE REFERENCES episode_pengobatan(id_episode) ON DELETE CASCADE NOT NULL,
  id_tes INTEGER REFERENCES pemeriksaan_lab(id_tes) ON DELETE SET NULL,
  id_nakes INTEGER REFERENCES nakes(id_nakes) ON DELETE SET NULL,
  tanggal_diagnosis DATE NOT NULL,
  kode_icd10 VARCHAR(10) DEFAULT 'A15', -- Kode standar TB Paru
  jenis_tb VARCHAR(50), -- TB Paru, TB Ekstra Paru
  status_resistensi VARCHAR(50) CHECK (status_resistensi IN ('Sensitif Obat', 'Resisten Obat')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX idx_diagnosis_id_tes ON diagnosis(id_tes);
ALTER TABLE diagnosis ENABLE ROW LEVEL SECURITY;