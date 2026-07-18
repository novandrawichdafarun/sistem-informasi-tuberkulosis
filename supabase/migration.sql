CREATE TABLE users (
  id_user UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) CHECK (role IN ('pasien', 'nakes', 'super_admin')) NOT NULL,
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

CREATE TABLE faskes (
  id_faskes SERIAL PRIMARY KEY,
  nama_faskes VARCHAR(100) NOT NULL,
  jenis VARCHAR(50) NOT NULL, -- Puskesmas, Rumah Sakit, Klinik
  alamat TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE faskes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pengguna terautentikasi dapat melihat faskes" ON faskes
  FOR SELECT TO authenticated USING (true);

CREATE TABLE nakes (
  id_nakes SERIAL PRIMARY KEY,
  id_user UUID REFERENCES users(id_user) ON DELETE CASCADE NOT NULL,
  id_faskes INTEGER REFERENCES faskes(id_faskes) ON DELETE SET NULL,
  nama VARCHAR(100) NOT NULL,
  no_str_sip VARCHAR(50) UNIQUE,
  jabatan VARCHAR(50),
  no_hp VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX idx_nakes_id_user ON nakes(id_user);
create INDEX idx_nakes_id_faskes ON nakes(id_faskes);
ALTER TABLE nakes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Nakes bisa melihat profil nakes lain se-faskes" ON nakes
  FOR SELECT TO authenticated USING (true);

CREATE TABLE pasien (
  id_pasien SERIAL PRIMARY KEY,
  id_user UUID REFERENCES users(id_user) ON DELETE CASCADE NOT NULL,
  id_nakes INTEGER REFERENCES nakes(id_nakes) ON DELETE SET NULL,
  id_faskes INTEGER REFERENCES faskes(id_faskes) ON DELETE SET NULL,
  no_rm VARCHAR(50) UNIQUE, -- Nomor Rekam Medis
  nik CHAR(16) UNIQUE NOT NULL,
  nama_lengkap VARCHAR(100) NOT NULL,
  tanggal_lahir DATE NOT NULL,
  jenis_kelamin CHAR(1) CHECK (jenis_kelamin IN ('L', 'P')) NOT NULL,
  alamat TEXT,
  no_telp VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX idx_pasien_id_user ON pasien(id_user);
CREATE INDEX idx_pasien_id_nakes ON pasien(id_nakes);
CREATE INDEX idx_pasien_id_faskes ON pasien(id_faskes);
ALTER TABLE pasien ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pasien melihat data sendiri atau Nakes melihat data pasien binaannya" ON pasien
  FOR SELECT TO authenticated USING (
    auth.uid() = id_user OR 
    id_nakes IN (SELECT id_nakes FROM nakes WHERE id_user = auth.uid())
  );

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

CREATE TABLE pemeriksaan_lab (
  id_tes SERIAL PRIMARY KEY,
  id_episode INTEGER REFERENCES episode_pengobatan(id_episode) ON DELETE CASCADE NOT NULL,
  id_nakes INTEGER REFERENCES nakes(id_nakes) ON DELETE SET NULL,
  jenis_tes VARCHAR(50) NOT NULL, -- TCM, IGRA, Mantoux, BTA, Rontgen
  tanggal_tes DATE NOT NULL,
  periode_bulanan VARCHAR(50), -- Bulan ke-2, ke-5, akhir masa pengobatan

  -- Data Sample
  jenis_sample VARCHAR(50), -- Sputum (dahak), Cairan Serebrospinal (LCS), Jaringan (Biopsi), Bilasan Lambung

  -- Hasil Tes Khusus Molekuler (TCM)
  dna_bakteri_tb VARCHAR(50) NOT NULL, -- Isi beban kuman khusus TCM: High, Medium, Low, Very Low, Trace
  status_resistensi VARCHAR(50) NOT NULL, -- Resisten / Sensitif / Indeterminate (Terutama untuk Rifampisin pada TCM atau obat lain)

  hasil_tes VARCHAR(100) NOT NULL, -- Hasil umum: Positif / Negatif / Normal / Kesan TB Paru Aktif

  hasil_bta VARCHAR(100), -- Khusus tes BTA: Negatif / Scanty (tulis jumlahnya) / 1+ / 2+ / 3+
  berkas_pendukung_url VARCHAR(255), -- Link berkas di Supabase Storage
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX idx_pemeriksaan_lab_episode ON pemeriksaan_lab(id_episode);
ALTER TABLE pemeriksaan_lab ENABLE ROW LEVEL SECURITY;

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

CREATE TABLE resep_pengobatan (
  id_resep SERIAL PRIMARY KEY,
  id_episode INTEGER REFERENCES episode_pengobatan(id_episode) ON DELETE CASCADE NOT NULL,
  id_nakes INTEGER REFERENCES nakes(id_nakes) ON DELETE SET NULL,
  tanggal_mulai_obat DATE NOT NULL,
  kategori_regimen VARCHAR(50) NOT NULL, -- Kategori 1 (HRZE), Kategori 2, Anak
  durasi_hari INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX idx_resep_pengobatan_episode ON resep_pengobatan(id_episode);
ALTER TABLE resep_pengobatan ENABLE ROW LEVEL SECURITY;

CREATE TABLE detail_obat (
  id_detail SERIAL PRIMARY KEY,
  id_resep INTEGER REFERENCES resep_pengobatan(id_resep) ON DELETE CASCADE NOT NULL,
  nama_obat VARCHAR(100) NOT NULL, -- Rifampisin, Isoniazid, Pirazinamid, Etambutol
  dosis VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX idx_detail_obat_resep ON detail_obat(id_resep);
ALTER TABLE detail_obat ENABLE ROW LEVEL SECURITY;

CREATE TABLE jadwal_minum_obat (
  id_jadwal SERIAL PRIMARY KEY,
  id_resep INTEGER REFERENCES resep_pengobatan(id_resep) ON DELETE CASCADE NOT NULL,
  tanggal_jadwal DATE NOT NULL,
  jam_jadwal TIME DEFAULT '07:00:00' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX idx_jadwal_minum_obat_resep ON jadwal_minum_obat(id_resep);
CREATE INDEX idx_jadwal_minum_obat_tanggal ON jadwal_minum_obat(tanggal_jadwal);
ALTER TABLE jadwal_minum_obat ENABLE ROW LEVEL SECURITY;

CREATE TABLE medication_log (
  id_log SERIAL PRIMARY KEY,
  id_jadwal INTEGER UNIQUE REFERENCES jadwal_minum_obat(id_jadwal) ON DELETE CASCADE NOT NULL,
  status VARCHAR(20) CHECK (status IN ('diminum', 'terlewat')) NOT NULL,
  catatan_efek_samping TEXT,
  bukti_foto_url VARCHAR(255),
  reported_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  reported_by VARCHAR(20) CHECK (reported_by IN ('pasien', 'pendamping')) NOT NULL
);

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

CREATE TABLE pesan_chat (
  id_pesan SERIAL PRIMARY KEY,
  id_pasien INTEGER REFERENCES pasien(id_pasien) ON DELETE CASCADE NOT NULL,
  id_pengirim UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  isi_pesan TEXT NOT NULL,
  lampiran_file_url VARCHAR(255),
  waktu_kirim TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  status_baca VARCHAR(20) DEFAULT 'belum dibaca' CHECK (status_baca IN ('dibaca', 'belum dibaca')) NOT NULL
);

CREATE INDEX idx_pesan_chat_pasien_waktu ON pesan_chat(id_pasien, waktu_kirim DESC);
ALTER TABLE pesan_chat ENABLE ROW LEVEL SECURITY;