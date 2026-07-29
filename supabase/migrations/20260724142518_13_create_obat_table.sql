CREATE TABLE obat (
  id_obat SERIAL PRIMARY KEY,
  nama_obat VARCHAR(100) NOT NULL,
  jenis_obat VARCHAR(50) NOT NULL, -- KDT (Kombinasi Dosis Tetap) / Tunggal / Injeksi
  kategori_obat VARCHAR(50) NOT NULL, -- Lini Pertama, Lini Kedua, Suplement, dll
  deskripsi TEXT,
  dosis VARCHAR(100), -- Contoh: "300mg", "150mg/75mg/400mg/275mg"
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,

  CONSTRAINT unique_nama_dosis UNIQUE (nama_obat, dosis)
);

ALTER TABLE obat ENABLE ROW LEVEL SECURITY;
