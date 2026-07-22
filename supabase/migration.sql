CREATE TABLE users (
  id_user UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) CHECK (role IN ('pasien', 'super_admin')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pengguna dapat melihat profil mereka sendiri" ON users
  FOR SELECT USING (
      current_setting('request.jwt.claims', true)::json->>'sub' = id_user::text 
      OR 
      current_setting('my.custom.user_id', true) = id_user::text
    );

CREATE TABLE password_resets (
  id SERIAL PRIMARY KEY,
  email VARCHAR(100) NOT NULL,
  token VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_password_resets_email ON password_resets(email);
ALTER TABLE password_resets ENABLE ROW LEVEL SECURITY;

CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_user UUID REFERENCES users(id_user) ON DELETE CASCADE,
  session_token TEXT UNIQUE NOT NULL, 
  device_info TEXT, 
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_user_sessions_user ON user_sessions(id_user);
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

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

CREATE TABLE pemeriksaan_klinis (
  id_periksa SERIAL PRIMARY KEY,
  id_episode INTEGER REFERENCES episode_pengobatan(id_episode) ON DELETE CASCADE NOT NULL,
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

CREATE TABLE pemeriksaan_lab (
  id_tes SERIAL PRIMARY KEY,
  id_episode INTEGER REFERENCES episode_pengobatan(id_episode) ON DELETE CASCADE NOT NULL,
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

CREATE TABLE diagnosis (
  id_diagnosis SERIAL PRIMARY KEY,
  id_episode INTEGER UNIQUE REFERENCES episode_pengobatan(id_episode) ON DELETE CASCADE NOT NULL,
  tanggal_diagnosis DATE NOT NULL,
  
  -- standarisasi Medis
  kode_icd10 VARCHAR(10) DEFAULT 'A15' NOT NULL, -- Kode standar TB: A15.0 (TB Paru), A18.2 (TB Kelenjar)
  klasifikasi_anatomi VARCHAR(50), -- TB Paru, TB Ekstra Paru
  lokasi_anatomi_detail VARCHAR(100), -- Jika Ekstraparu, sebutkan: Kelenjar getah bening / Pleura / Meninges / Tulang
  
  -- Kesimpulan Resistensi (Pondasi penentu jenis regimen obat)
  klasifikasi_resistensi VARCHAR(50) NOT NULL, -- TB-SO (Sensitif Obat) / TB-RO (Resisten Obat) / Terduga TB-RO
  tipe_resistensi_detail VARCHAR(50), -- Monoresisten Rifampisin (TB-RR) / MDR-TB / XDR-TB / Null jika SO

  dasar_diagnosis VARCHAR(50), -- Terkonfirmasi Bakteriologis (TCM/BTA+) / Terdiagnosis Klinis (Gejala + Rontgen) 
  catatan_klinis text, -- Catatan tambahan dokter terkait kondisi komorbid seperti TB-HIV atau TB-DM
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX idx_diagnosis_episode ON diagnosis(id_episode);
ALTER TABLE diagnosis ENABLE ROW LEVEL SECURITY;

CREATE TABLE resep_pengobatan (
  id_resep SERIAL PRIMARY KEY,
  id_episode INTEGER REFERENCES episode_pengobatan(id_episode) ON DELETE CASCADE NOT NULL,
  tanggal_resep DATE NOT NULL,
  
  -- Klasifikasi Regimen
  kategori_regimen VARCHAR(50) NOT NULL, -- Kategori 1 (HRZE), Kategori 2, Anak
  fase_pengobatan VARCHAR(20), -- Intensif / Lanjutan

  -- Manajemen Waktu
  tanggal_mulai_obat DATE NOT NULL,
  durasi_hari INTEGER NOT NULL, -- Durasi resep berlaku, misal: 28 hari atau 56 hari
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX idx_resep_pengobatan_episode ON resep_pengobatan(id_episode);
ALTER TABLE resep_pengobatan ENABLE ROW LEVEL SECURITY;

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

CREATE TABLE jadwal_minum_obat (
  id_jadwal SERIAL PRIMARY KEY,
  id_resep INTEGER REFERENCES resep_pengobatan(id_resep) ON DELETE CASCADE NOT NULL,
  id_detail_obat INTEGER REFERENCES detail_obat(id_detail_obat) ON DELETE CASCADE NOT NULL,
  tanggal_jadwal DATE NOT NULL,
  jam_jadwal TIME DEFAULT '07:00:00' NOT NULL,
  status_pengingat VARCHAR(20) DEFAULT 'Pending' NOT NULL, -- pending / terkirim / gagal_kirim
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX idx_jadwal_minum_obat_resep ON jadwal_minum_obat(id_resep);
CREATE INDEX idx_jadwal_minum_obat_detail_obat ON jadwal_minum_obat(id_detail_obat);
CREATE INDEX idx_jadwal_minum_obat_tanggal ON jadwal_minum_obat(tanggal_jadwal);
ALTER TABLE jadwal_minum_obat ENABLE ROW LEVEL SECURITY;

CREATE TABLE medication_log (
  id_log SERIAL PRIMARY KEY,
  id_jadwal INTEGER UNIQUE REFERENCES jadwal_minum_obat(id_jadwal) ON DELETE CASCADE NOT NULL,
  status VARCHAR(20) CHECK (status IN ('diminum', 'terlewat', 'ditunda')) NOT NULL,
  catatan_kepatuhan TEXT,
  reported_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  reported_by VARCHAR(20) CHECK (reported_by IN ('pasien', 'pendamping', 'nakes')) NOT NULL
);

CREATE INDEX idx_medication_log_jadwal ON medication_log(id_jadwal);
ALTER TABLE medication_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pasien kelola log sendiri" ON medication_log
  FOR ALL TO authenticated USING (
    id_jadwal IN (
      SELECT id_jadwal FROM jadwal_minum_obat j
      JOIN resep_pengobatan r ON j.id_resep = r.id_resep
      JOIN episode_pengobatan e ON r.id_episode = e.id_episode
      JOIN pasien p ON e.id_pasien = p.id_pasien
      WHERE p.id_user = auth.uid()
    )
  );

CREATE TABLE hasil_akhir (
  id_hasil SERIAL PRIMARY KEY,
  id_episode INTEGER UNIQUE REFERENCES episode_pengobatan(id_episode) ON DELETE CASCADE NOT NULL,
  tanggal_selesai DATE DEFAULT CURRENT_DATE NOT NULL,
  status_akhir VARCHAR(50) CHECK (status_akhir IN ('Sembuh', 'Pengobatan Lengkap', 'Meninggal', 'Gagal', 'Putus Berobat')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE hasil_akhir ENABLE ROW LEVEL SECURITY;

CREATE TABLE notifikasi (
  id_notifikasi SERIAL PRIMARY KEY,
  id_user UUID REFERENCES users(id_user) ON DELETE CASCADE NOT NULL, -- Penerima notifikasi
  judul VARCHAR(100) NOT NULL,
  pesan TEXT NOT NULL,
  waktu_kirim TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX idx_notifikasi_id_user ON notifikasi(id_user);
CREATE INDEX idx_notifikasi_waktu_kirim ON notifikasi(waktu_kirim);
CREATE INDEX idx_notifikasi_created_at ON notifikasi(created_at);
ALTER TABLE notifikasi ENABLE ROW LEVEL SECURITY;