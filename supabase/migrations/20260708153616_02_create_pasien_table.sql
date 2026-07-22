CREATE TABLE pasien (
  id_pasien SERIAL PRIMARY KEY,
  id_user UUID REFERENCES users(id_user) ON DELETE CASCADE NOT NULL,
  nama_lengkap VARCHAR(100) NOT NULL,
  usia VARCHAR(20) NOT NULL, -- Balita (< 5 tahun), Anak-anak (5-11 tahun), Remaja (12-25 tahun), Dewasa (26-45 tahun), Lansia (56-65 tahun), Manula (> 65 tahun), dkk
  jenis_kelamin CHAR(1) CHECK (jenis_kelamin IN ('L', 'P')) NOT NULL,
  domisili TEXT,
  no_telp VARCHAR(20),
  pendidikan VARCHAR(20) NOT NULL, -- SD, SMP, SMA, Diploma (D1/D2/D3/D4), Sarjana (S1), Magister (S2), Doktor (S3) dkk
  pekerjaan VARCHAR(50) NOT NULL, -- Ibu Rumah Tangga, Wirausaha, PNS/ASN, TNI/Polri, Pegawai BUMN/BUMD, Karyawan Swasta, Buruh, Pensiun, dkk
  pendapatan VARCHAR(50) NOT NULL, -- Dibawa rata-rata (< 1.5jt), Kelas Bawah (1.5jt - 3jt), Kelas Menengah-Bawah (3jt - 5jt), Kelas Menengah (5jt - 10jt), Kelas Menegah Atas (10jt - 20jt), Kelas Atas (> 20jt)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX idx_pasien_id_user ON pasien(id_user);
ALTER TABLE pasien ENABLE ROW LEVEL SECURITY;