CREATE TABLE hasil_akhir (
  id_hasil SERIAL PRIMARY KEY,
  id_episode INTEGER UNIQUE REFERENCES episode_pengobatan(id_episode) ON DELETE CASCADE NOT NULL,
  tanggal_selesai DATE DEFAULT CURRENT_DATE NOT NULL,
  status_akhir VARCHAR(50) CHECK (status_akhir IN ('Sembuh', 'Pengobatan Lengkap', 'Meninggal', 'Gagal', 'Putus Berobat')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE hasil_akhir ENABLE ROW LEVEL SECURITY;