-- =====================================================================
-- SISTEM INFORMASI TUBERKULOSIS (SITB) — MySQL Schema
-- Konversi dari: PostgreSQL 15 (Supabase)
-- Target      : MySQL 8.0.16+ atau MariaDB 10.5+
-- Kompatibel  : Laragon (dev) & Hostinger MySQL (production)
--
-- CATATAN KEAMANAN KRITIS:
--   1. Semua RLS (Row Level Security) dari Supabase TELAH DIHAPUS.
--      MySQL tidak memiliki padanan RLS. Authorization WAJIB
--      diimplementasikan di layer Server Actions Next.js.
--      Lihat: services/authorization.ts (contoh di dokumentasi).
--
--   2. Semua kolom DATETIME disimpan sebagai UTC.
--      Connection pool WAJIB mengeset timezone '+00:00' atau 'Z'.
--
--   3. UUID format lowercase agar konsisten dengan data lama PostgreSQL.
--      Aplikasi WAJIB generate UUID pakai crypto.randomUUID() (Node.js)
--      yang menghasilkan lowercase.
--
--   4. CHECK constraint memerlukan:
--      - MySQL 8.0.16+ (di bawah versi ini akan diabaikan, tidak error)
--      - MariaDB 10.2.1+
--      Verifikasi versi Anda: SELECT VERSION();
-- =====================================================================

SET NAMES utf8mb4;
SET SQL_MODE = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';
SET FOREIGN_KEY_CHECKS = 0;

-- =====================================================================
-- DROP semua tabel (reverse dependency order) untuk clean re-run
-- =====================================================================
DROP TABLE IF EXISTS notifikasi;
DROP TABLE IF EXISTS hasil_akhir;
DROP TABLE IF EXISTS laporan_makan;
DROP TABLE IF EXISTS medication_log;
DROP TABLE IF EXISTS jadwal_minum_obat;
DROP TABLE IF EXISTS detail_obat;
DROP TABLE IF EXISTS obat;
DROP TABLE IF EXISTS resep_pengobatan;
DROP TABLE IF EXISTS diagnosis;
DROP TABLE IF EXISTS pemeriksaan_lab;
DROP TABLE IF EXISTS pemeriksaan_klinis;
DROP TABLE IF EXISTS episode_pengobatan;
DROP TABLE IF EXISTS pasien;
DROP TABLE IF EXISTS user_sessions;
DROP TABLE IF EXISTS password_resets;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================================
-- TABEL 1: users
-- Sumber auth. Dulu di Supabase pakai RLS untuk isolasi profil pengguna.
-- Sekarang: cek `user.id_user === session.userId` di Server Action.
-- =====================================================================
CREATE TABLE users (
  id_user       CHAR(36)     NOT NULL DEFAULT (LOWER(UUID())),
  email         VARCHAR(100) NOT NULL,
  password_hash TEXT         NOT NULL,
  role          VARCHAR(20)  NOT NULL,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_user),
  UNIQUE KEY uk_users_email (email),
  CONSTRAINT chk_users_role CHECK (role IN ('pasien', 'super_admin'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- TABEL 2: password_resets
-- =====================================================================
CREATE TABLE password_resets (
  id         INT          NOT NULL AUTO_INCREMENT,
  email      VARCHAR(100) NOT NULL,
  token      VARCHAR(255)   NOT NULL,
  expires_at DATETIME     NOT NULL,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_password_resets_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- TABEL 3: user_sessions
-- Catatan: session_token diubah dari TEXT -> VARCHAR(512) karena
-- MySQL tidak mendukung UNIQUE pada tipe TEXT tanpa prefix length.
-- 512 cukup untuk JWT panjang atau opaque session ID.
-- =====================================================================
CREATE TABLE user_sessions (
  id             CHAR(36)     NOT NULL DEFAULT (LOWER(UUID())),
  id_user        CHAR(36)     DEFAULT NULL,
  session_token  VARCHAR(512) NOT NULL,
  device_info    TEXT         DEFAULT NULL,
  last_active_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_user_sessions_token (session_token),
  KEY idx_user_sessions_user (id_user),
  CONSTRAINT fk_user_sessions_user
    FOREIGN KEY (id_user) REFERENCES users(id_user) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- TABEL 4: pasien
-- =====================================================================
CREATE TABLE pasien (
  id_pasien     INT          NOT NULL AUTO_INCREMENT,
  id_user       CHAR(36)     NOT NULL,
  nama_lengkap  VARCHAR(100) NOT NULL,
  usia          VARCHAR(20)  NOT NULL,
  jenis_kelamin CHAR(1)      NOT NULL,
  domisili      TEXT         DEFAULT NULL,
  no_telp       VARCHAR(20)  DEFAULT NULL,
  pendidikan    VARCHAR(20)  NOT NULL,
  pekerjaan     VARCHAR(50)  NOT NULL,
  pendapatan    VARCHAR(50)  NOT NULL,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_pasien),
  KEY idx_pasien_id_user (id_user),
  CONSTRAINT fk_pasien_user
    FOREIGN KEY (id_user) REFERENCES users(id_user) ON DELETE CASCADE,
  CONSTRAINT chk_pasien_jenis_kelamin CHECK (jenis_kelamin IN ('L', 'P'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- TABEL 5: episode_pengobatan
-- =====================================================================
CREATE TABLE episode_pengobatan (
  id_episode      INT         NOT NULL AUTO_INCREMENT,
  id_pasien       INT         NOT NULL,
  tanggal_mulai   DATE        NOT NULL,
  tanggal_selesai DATE        NOT NULL,
  tipe_pasien     VARCHAR(50) DEFAULT NULL,
  status_episode  VARCHAR(20) NOT NULL DEFAULT 'aktif',
  created_at      DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_episode),
  KEY idx_episode_pengobatan_pasien (id_pasien),
  CONSTRAINT fk_episode_pasien
    FOREIGN KEY (id_pasien) REFERENCES pasien(id_pasien) ON DELETE CASCADE,
  CONSTRAINT chk_episode_status CHECK (status_episode IN ('aktif', 'selesai'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- TABEL 6: pemeriksaan_klinis
-- =====================================================================
CREATE TABLE pemeriksaan_klinis (
  id_periksa      INT           NOT NULL AUTO_INCREMENT,
  id_episode      INT           NOT NULL,
  tanggal_periksa DATE          NOT NULL DEFAULT (CURRENT_DATE),
  keluhan         TEXT          DEFAULT NULL,
  tensi           VARCHAR(20)   DEFAULT NULL,
  suhu            DECIMAL(4,2)  DEFAULT NULL,
  pernapasan      INT           DEFAULT NULL,
  nadi            INT           DEFAULT NULL,
  saturasi_o2     INT           DEFAULT NULL,
  tinggi_badan    INT           DEFAULT NULL,
  berat_badan     DECIMAL(5,2)  DEFAULT NULL,
  created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_periksa),
  KEY idx_pemeriksaan_klinis_episode (id_episode),
  CONSTRAINT fk_klinis_episode
    FOREIGN KEY (id_episode) REFERENCES episode_pengobatan(id_episode) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- TABEL 7: pemeriksaan_lab
-- Catatan: berkas_pendukung_url — semula "Link Supabase Storage",
-- sekarang diarahkan ke solusi storage lain (S3, filesystem Hostinger, dll).
-- =====================================================================
CREATE TABLE pemeriksaan_lab (
  id_tes               INT          NOT NULL AUTO_INCREMENT,
  id_episode           INT          NOT NULL,
  jenis_tes            VARCHAR(50)  NOT NULL,
  tanggal_tes          DATE         NOT NULL,
  periode_pemeriksaan  VARCHAR(50)  NOT NULL,
  -- Data Sample
  jenis_sample         VARCHAR(50)  DEFAULT NULL,
  kualitas_sample      VARCHAR(50)  DEFAULT NULL,
  -- Hasil Molekuler (TCM)
  dna_bakteri_tb       VARCHAR(50)  NOT NULL,
  -- Hasil Umum (Rontgen/Mantoux/IGRA)
  hasil_tes            CHAR(1)      NOT NULL,
  -- Hasil BTA
  hasil_bta            VARCHAR(100) DEFAULT NULL,
  catatan_lab          TEXT         DEFAULT NULL,
  berkas_pendukung_url VARCHAR(255) DEFAULT NULL,
  created_at           DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_tes),
  KEY idx_pemeriksaan_lab_episode (id_episode),
  CONSTRAINT fk_lab_episode
    FOREIGN KEY (id_episode) REFERENCES episode_pengobatan(id_episode) ON DELETE CASCADE,
  CONSTRAINT chk_lab_hasil_tes CHECK (hasil_tes IN ('P', 'N'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- TABEL 8: diagnosis
-- Catatan: index duplikat (UNIQUE + KEY pada id_episode) dari schema
-- PostgreSQL disederhanakan menjadi hanya UNIQUE (yang auto-index).
-- =====================================================================
CREATE TABLE diagnosis (
  id_diagnosis           INT          NOT NULL AUTO_INCREMENT,
  id_episode             INT          NOT NULL,
  tanggal_diagnosis      DATE         NOT NULL,
  klasifikasi_anatomi    VARCHAR(50)  NOT NULL,
  lokasi_anatomi         VARCHAR(100) DEFAULT NULL,
  dasar_diagnosis        VARCHAR(50)  DEFAULT NULL,
  catatan_klinis         TEXT         DEFAULT NULL,
  created_at             DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_diagnosis),
  UNIQUE KEY uk_diagnosis_episode (id_episode),
  CONSTRAINT fk_diagnosis_episode
    FOREIGN KEY (id_episode) REFERENCES episode_pengobatan(id_episode) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- TABEL 9: resep_pengobatan
-- =====================================================================
CREATE TABLE resep_pengobatan (
  id_resep           INT         NOT NULL AUTO_INCREMENT,
  id_episode         INT         NOT NULL,
  tanggal_resep      DATE        NOT NULL,
  kategori_regimen   VARCHAR(50) NOT NULL,
  fase_pengobatan    VARCHAR(20) DEFAULT NULL,
  tanggal_mulai_obat DATE        NOT NULL,
  durasi_hari        INT         NOT NULL,
  created_at         DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_resep),
  KEY idx_resep_pengobatan_episode (id_episode),
  CONSTRAINT fk_resep_episode
    FOREIGN KEY (id_episode) REFERENCES episode_pengobatan(id_episode) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- TABEL 10: obat
-- Catatan: (nama_obat, dosis) UNIQUE tetap dipertahankan.
-- Karena dosis nullable, MySQL menganggap tiap NULL sebagai unik
-- (behavior sama dengan PostgreSQL). Kalau perlu strict, buat dosis NOT NULL.
-- =====================================================================
CREATE TABLE obat (
  id_obat       INT          NOT NULL AUTO_INCREMENT,
  nama_obat     VARCHAR(100) NOT NULL,
  deskripsi     TEXT         DEFAULT NULL,
  dosis         VARCHAR(100) DEFAULT NULL,
  is_active     TINYINT(1)   NOT NULL DEFAULT 1,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_obat),
  UNIQUE KEY unique_nama_dosis (nama_obat, dosis)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- TABEL 11: detail_obat
-- =====================================================================
CREATE TABLE detail_obat (
  id_detail_obat         INT          NOT NULL AUTO_INCREMENT,
  id_resep               INT          NOT NULL,
  id_obat                INT          NOT NULL,
  jumlah_obat_per_minum  DECIMAL(4,2) NOT NULL,
  frekuensi_minum        VARCHAR(50)  NOT NULL,
  aturan_pakai           VARCHAR(100) NOT NULL,
  jumlah_total_diberikan INT          NOT NULL,
  created_at             DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_detail_obat),
  KEY idx_detail_obat_resep (id_resep),
  KEY idx_detail_obat_obat (id_obat),
  CONSTRAINT fk_detail_obat_resep
    FOREIGN KEY (id_resep) REFERENCES resep_pengobatan(id_resep) ON DELETE CASCADE,
  CONSTRAINT fk_detail_obat_obat
    FOREIGN KEY (id_obat) REFERENCES obat(id_obat) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- TABEL 12: jadwal_minum_obat
-- =====================================================================
CREATE TABLE jadwal_minum_obat (
  id_jadwal        INT         NOT NULL AUTO_INCREMENT,
  id_resep         INT         NOT NULL,
  id_detail_obat   INT         NOT NULL,
  tanggal_jadwal   DATE        NOT NULL,
  jam_jadwal       TIME        NOT NULL DEFAULT '09:00:00',
  status_pengingat VARCHAR(20) NOT NULL DEFAULT 'Pending',
  created_at       DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_jadwal),
  KEY idx_jadwal_minum_obat_resep (id_resep),
  KEY idx_jadwal_minum_obat_detail_obat (id_detail_obat),
  KEY idx_jadwal_minum_obat_tanggal (tanggal_jadwal),
  CONSTRAINT fk_jadwal_resep
    FOREIGN KEY (id_resep) REFERENCES resep_pengobatan(id_resep) ON DELETE CASCADE,
  CONSTRAINT fk_jadwal_detail_obat
    FOREIGN KEY (id_detail_obat) REFERENCES detail_obat(id_detail_obat) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- TABEL 13: medication_log
-- Semula ada RLS: "Pasien kelola log sendiri".
-- Sekarang: WAJIB verifikasi di Server Action bahwa
--   session.userId === pasien.id_user (via join episode -> pasien).
-- Lihat contoh helper verifyOwnershipMedicationLog() di dokumentasi.
-- =====================================================================
CREATE TABLE medication_log (
  id_log            INT         NOT NULL AUTO_INCREMENT,
  id_jadwal         INT         NOT NULL,
  status            VARCHAR(10) NOT NULL,
  catatan_kepatuhan TEXT        DEFAULT NULL,
  reported_at       DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reported_by       VARCHAR(20) NOT NULL,
  PRIMARY KEY (id_log),
  UNIQUE KEY uk_medication_log_jadwal (id_jadwal),
  CONSTRAINT fk_medication_log_jadwal
    FOREIGN KEY (id_jadwal) REFERENCES jadwal_minum_obat(id_jadwal) ON DELETE CASCADE,
  CONSTRAINT chk_medication_log_status
    CHECK (status IN ('diminum', 'terlewat')),
  CONSTRAINT chk_medication_log_reported_by
    CHECK (reported_by IN ('pasien', 'pendamping', 'nakes'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- TABEL 14: laporan_makan
-- =====================================================================
CREATE TABLE laporan_makan (
  id_laporan  INT         NOT NULL AUTO_INCREMENT,
  id_episode  INT         NOT NULL,
  waktu_makan DATETIME    NOT NULL,
  karbo       VARCHAR(50) NOT NULL,
  protein     VARCHAR(50) NOT NULL,
  serat       VARCHAR(50) NOT NULL,
  catatan     TEXT        DEFAULT NULL,
  reported_at DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_laporan),
  KEY idx_laporan_makan_episode (id_episode),
  KEY idx_laporan_makan_waktu (waktu_makan),
  CONSTRAINT fk_laporan_episode
    FOREIGN KEY (id_episode) REFERENCES episode_pengobatan(id_episode) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- TABEL 15: hasil_akhir
-- =====================================================================
CREATE TABLE hasil_akhir (
  id_hasil          INT         NOT NULL AUTO_INCREMENT,
  id_episode        INT         NOT NULL,
  tanggal_penetapan DATE        NOT NULL DEFAULT (CURRENT_DATE),
  status_akhir      VARCHAR(50) NOT NULL,
  catatan_akhir     TEXT        DEFAULT NULL,
  created_at        DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_hasil),
  UNIQUE KEY uk_hasil_akhir_episode (id_episode),
  CONSTRAINT fk_hasil_akhir_episode
    FOREIGN KEY (id_episode) REFERENCES episode_pengobatan(id_episode) ON DELETE CASCADE,
  CONSTRAINT chk_hasil_status
    CHECK (status_akhir IN ('Sembuh', 'Pengobatan Lengkap', 'Meninggal', 'Gagal', 'Putus Berobat'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- TABEL 16: notifikasi
-- =====================================================================
CREATE TABLE notifikasi (
  id_notifikasi INT          NOT NULL AUTO_INCREMENT,
  id_user       CHAR(36)     NOT NULL,
  judul         VARCHAR(100) NOT NULL,
  pesan         TEXT         NOT NULL,
  waktu_kirim   DATETIME     NOT NULL,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_notifikasi),
  KEY idx_notifikasi_id_user (id_user),
  KEY idx_notifikasi_waktu_kirim (waktu_kirim),
  KEY idx_notifikasi_created_at (created_at),
  CONSTRAINT fk_notifikasi_user
    FOREIGN KEY (id_user) REFERENCES users(id_user) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- Verifikasi hasil (opsional, jalankan setelah import)
-- =====================================================================
-- SHOW TABLES;
-- SELECT VERSION();
-- SHOW VARIABLES LIKE 'time_zone';
-- SELECT TABLE_NAME, ENGINE, TABLE_COLLATION
--   FROM information_schema.TABLES
--   WHERE TABLE_SCHEMA = DATABASE();
