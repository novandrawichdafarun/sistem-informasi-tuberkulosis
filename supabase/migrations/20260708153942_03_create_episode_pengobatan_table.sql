CREATE TABLE episode_pengobatan (
  id_episode SERIAL PRIMARY KEY,
  id_pasien INTEGER REFERENCES pasien(id_pasien) ON DELETE CASCADE NOT NULL,
  tanggal_mulai DATE NOT NULL,
  tanggal_selesai DATE,
  tipe_pasien VARCHAR(50), -- Kasus Baru, Kambuh, Default, Gagal
  status_episode VARCHAR(20) DEFAULT 'aktif' CHECK (status_episode IN ('aktif', 'selesai')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX idx_episode_pengobatan_pasien ON episode_pengobatan(id_pasien);
ALTER TABLE episode_pengobatan ENABLE ROW LEVEL SECURITY;
