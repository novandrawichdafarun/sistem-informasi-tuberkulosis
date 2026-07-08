CREATE TABLE detail_obat (
  id_detail SERIAL PRIMARY KEY,
  id_resep INTEGER REFERENCES resep_pengobatan(id_resep) ON DELETE CASCADE NOT NULL,
  nama_obat VARCHAR(100) NOT NULL, -- Rifampisin, Isoniazid, Pirazinamid, Etambutol
  dosis VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE detail_obat ENABLE ROW LEVEL SECURITY;