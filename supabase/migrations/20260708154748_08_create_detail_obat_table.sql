CREATE TABLE detail_obat (
  id_detail_obat SERIAL PRIMARY KEY,
  id_resep INTEGER REFERENCES resep_pengobatan(id_resep) ON DELETE CASCADE NOT NULL,
  nama_obat VARCHAR(100) NOT NULL, -- Rifampisin, Isoniazid, Pirazinamid, Etambutol
  jenis_obat VARCHAR(50) NOT NULL, -- KDT (Kombinasi Dosis Tetap) / Tunggal / Injeksi

  jumlah_obat_per_minum DECIMAL(4,2) NOT NULL, -- Contoh: 3.00 (artinya 3 tablet sekali minum), atau 1.50 (1 setengah tablet)
  frekuensi_minum VARCHAR(50) NOT NULL, -- 1x sehari / 3x seminggu / 1x seminggu

  aturan_pakai VARCHAR(100) NOT NULL, -- Sebelum makan / sesudah makan / saat perut kosong pagi hari
  jumlah_total_diberikan INTEGER NOT NULL, -- Total fisik obat yang dibawa pulang pasien, misal: 84 tablet
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX idx_detail_obat_resep ON detail_obat(id_resep);
ALTER TABLE detail_obat ENABLE ROW LEVEL SECURITY;