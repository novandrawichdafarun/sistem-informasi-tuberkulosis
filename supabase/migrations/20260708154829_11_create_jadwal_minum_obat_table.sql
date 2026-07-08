CREATE TABLE jadwal_minum_obat (
  id_jadwal SERIAL PRIMARY KEY,
  id_resep INTEGER REFERENCES resep_pengobatan(id_resep) ON DELETE CASCADE NOT NULL,
  tanggal_jadwal DATE NOT NULL,
  jam_jadwal TIME DEFAULT '07:00:00' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE jadwal_minum_obat ENABLE ROW LEVEL SECURITY;