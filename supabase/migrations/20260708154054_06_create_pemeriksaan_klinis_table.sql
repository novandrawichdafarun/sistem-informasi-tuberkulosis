CREATE TABLE pemeriksaan_klinis (
  id_periksa SERIAL PRIMARY KEY,
  id_episode INTEGER REFERENCES episode_pengobatan(id_episode) ON DELETE CASCADE NOT NULL,
  id_nakes INTEGER REFERENCES nakes(id_nakes) ON DELETE SET NULL NOT NULL,
  tanggal_periksa DATE DEFAULT CURRENT_DATE NOT NULL,
  keluhan TEXT,
  tensi VARCHAR(20),
  suhu DECIMAL(4,2),
  pernapasan INTEGER,
  nadi INTEGER,
  saturasi_o2 INTEGER,
  tinggi_badan INTEGER,
  berat_badan DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX idx_pemeriksaan_klinis_episode ON pemeriksaan_klinis(id_episode);
ALTER TABLE pemeriksaan_klinis ENABLE ROW LEVEL SECURITY;