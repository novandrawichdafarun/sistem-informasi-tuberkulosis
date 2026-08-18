-- =====================================================================
-- SEED DATA — MySQL Version
-- Konversi dari: PostgreSQL/Supabase seed.sql
--
-- CATATAN PENTING:
-- 1. Password untuk kedua user adalah "password123"
--    Hash bcrypt (cost 10) sudah di-pre-compute dan hard-code di bawah
--    karena MySQL tidak punya native bcrypt function.
--    Verified dengan bcryptjs (yang dipakai di auth.service.ts Anda).
--
-- 2. INSERT IGNORE dipakai sebagai pengganti ON CONFLICT DO NOTHING.
--    ⚠️ Tradeoff: INSERT IGNORE silence SEMUA error (bukan hanya PK conflict).
--    Kalau ada bug data (mis. FK violation), tidak akan muncul error.
--    Untuk seed data static, ini acceptable. Untuk production import,
--    pertimbangkan pakai ON DUPLICATE KEY UPDATE.
-- =====================================================================

SET NAMES utf8mb4;

-- =====================================================================
-- 1. TABEL users
-- =====================================================================
INSERT IGNORE INTO users (id_user, email, password_hash, role, created_at)
VALUES
  (
    '11111111-1111-1111-1111-111111111111',
    'dr.budi@faskes.go.id',
    '$2b$10$d9VyWAcFf/wrCV9I75BvOOcjfteXwOq/cPJCT3jAZqeK2RjsTd5fy',
    'super_admin',
    NOW()
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'budi.pasien@gmail.com',
    '$2b$10$kBNPFMvmhwn3zRioSQAt2.k7qZHsI6ZM7NrjmqrFFkk5EepXfzcOu',
    'pasien',
    NOW()
  );

-- =====================================================================
-- 2. TABEL pasien
-- =====================================================================
INSERT IGNORE INTO pasien (
  id_pasien, id_user, nama_lengkap, usia, jenis_kelamin,
  domisili, no_telp, pendidikan, pekerjaan, pendapatan, created_at
)
VALUES
  (
    1,
    '22222222-2222-2222-2222-222222222222',
    'Budi Santoso',
    'Dewasa (26-45 tahun)',
    'L',
    'Surabaya',
    '081234567890',
    'Sarjana (S1)',
    'Karyawan Swasta',
    'Kelas Menengah (5jt - 10jt)',
    NOW()
  );

-- =====================================================================
-- 3. TABEL obat (4 obat lini pertama OAT)
-- =====================================================================
INSERT IGNORE INTO obat (
  id_obat, nama_obat, kategori_obat, deskripsi, dosis, is_active, created_at
)
VALUES
  (1, 'Rifampisin',   'KDT', 'Obat anti TB lini pertama', '300', 1, NOW()),
  (2, 'Isoniazid',    'KDT', 'Obat anti TB lini pertama', '300', 1, NOW()),
  (3, 'Pyrazinamide', 'KDT', 'Obat anti TB lini pertama', '500', 1, NOW()),
  (4, 'Ethambutol',   'KDT', 'Obat anti TB lini pertama', '400', 1, NOW());

-- =====================================================================
-- 4. TABEL episode_pengobatan
-- =====================================================================
INSERT IGNORE INTO episode_pengobatan (
  id_episode, id_pasien, tanggal_mulai, tanggal_selesai, tipe_pasien, status_episode, created_at
)
VALUES
  (
    1,
    1,
    '2025-01-10',
    NULL,
    'Kasus Baru',
    'aktif',
    NOW()
  );

-- =====================================================================
-- 5. TABEL pemeriksaan_lab
-- =====================================================================
INSERT IGNORE INTO pemeriksaan_lab (
  id_tes, id_episode, jenis_tes, tanggal_tes, periode_pemeriksaan,
  jenis_sample, kualitas_sample, dna_bakteri_tb, hasil_tes, 
  hasil_bta, catatan_lab, berkas_pendukung_url, created_at
)
VALUES
  (
    1,
    1,
    'TCM',
    '2025-01-12',
    'Bulan ke-2',
    'Sputum (dahak)',
    'Purulen',
    'High',
    'P',
    '2+',
    'Hasil TCM menunjukkan beban kuman tinggi',
    'https://example.com/berkas/tcm-siti.pdf',
    NOW()
  );

-- =====================================================================
-- 6. TABEL pemeriksaan_klinis
-- =====================================================================
INSERT IGNORE INTO pemeriksaan_klinis (
  id_periksa, id_episode, tanggal_periksa, keluhan, tensi, suhu,
  pernapasan, nadi, saturasi_o2, tinggi_badan, berat_badan, created_at
)
VALUES
  (
    1,
    1,
    '2025-01-12',
    'Batuk berdahak, demam ringan, lemas',
    '120/80',
    37.8,
    22,
    84,
    97,
    160,
    48.5,
    NOW()
  );

-- =====================================================================
-- 7. TABEL diagnosis
-- =====================================================================
INSERT IGNORE INTO diagnosis (
  id_diagnosis, id_episode, tanggal_diagnosis, klasifikasi_anatomi,
  lokasi_anatomi, dasar_diagnosis, catatan_klinis, created_at
)
VALUES
  (
    1,
    1,
    '2025-01-12',
    'TB Paru',
    NULL,
    'Terkonfirmasi Bakteriologis (TCM/BTA+)',
    'Pasien terdiagnosis TB paru dengan gejala klasik dan hasil TCM positif',
    NOW()
  );

-- =====================================================================
-- Verifikasi (uncomment untuk cek hasil setelah seed)
-- =====================================================================
-- SELECT id_user, email, role, created_at FROM users;
-- SELECT id_pasien, nama_lengkap, jenis_kelamin FROM pasien;
-- SELECT id_obat, nama_obat, dosis, is_active FROM obat;
-- SELECT id_episode, id_pasien, status_episode, tanggal_mulai FROM episode_pengobatan;
-- SELECT COUNT(*) AS total_seed_rows FROM (
--   SELECT 'users' AS t, COUNT(*) AS c FROM users
--   UNION ALL SELECT 'pasien', COUNT(*) FROM pasien
--   UNION ALL SELECT 'obat', COUNT(*) FROM obat
--   UNION ALL SELECT 'episode_pengobatan', COUNT(*) FROM episode_pengobatan
--   UNION ALL SELECT 'pemeriksaan_lab', COUNT(*) FROM pemeriksaan_lab
--   UNION ALL SELECT 'pemeriksaan_klinis', COUNT(*) FROM pemeriksaan_klinis
--   UNION ALL SELECT 'diagnosis', COUNT(*) FROM diagnosis
-- ) x;