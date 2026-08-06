-- =========================================================================
-- 1. SEED DATA TABEL users (Profil Akun & Kredensial untuk NextAuth)
-- =========================================================================
-- Catatan: Password untuk kedua user ini adalah "password123" 
-- (sudah di-hash menggunakan Bcrypt)

CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO users (id_user, email, password_hash, role, created_at)
VALUES
  (
    '11111111-1111-1111-1111-111111111111', 
    'dr.budi@faskes.go.id', 
    crypt('password123', gen_salt('bf', 10)), 
    'super_admin', 
    NOW()
  ),
  (
    '22222222-2222-2222-2222-222222222222', 
    'budi.pasien@gmail.com', 
    crypt('password123', gen_salt('bf', 10)), 
    'pasien', 
    NOW()
  )
ON CONFLICT (id_user) DO NOTHING;

-- =========================================================================
-- 2. SEED DATA TABEL pasien (Data Medis Pasien TB)
-- =========================================================================

INSERT INTO pasien (
  id_pasien, id_user, nama_lengkap, usia, jenis_kelamin, 
  domisili, no_telp, pendidikan, pekerjaan, pendapatan, created_at
)
VALUES
  (
    1,
    '22222222-2222-2222-2222-222222222222', -- Menghubungkan ke ID user pasien di tabel users
    'Budi Santoso', 
    'Dewasa (26-45 tahun)', -- Kategori usia baru
    'L', -- Jenis kelamin (L/P)
    'Surabaya', -- Domisili tempat tinggal
    '081234567890',  -- Nomor telepon
    'Sarjana (S1)', -- Tingkat pendidikan terakhir
    'Karyawan Swasta', -- Pekerjaan
    'Kelas Menengah (5jt - 10jt)', -- Kategori Pendapatan
    NOW()
  )
ON CONFLICT (id_pasien) DO NOTHING;

-- =========================================================================
-- 3. SEED DATA OBAT, EPISODE, PEMERIKSAAN, DAN DIAGNOSIS
-- =========================================================================

INSERT INTO obat (
  id_obat, nama_obat, jenis_obat, kategori_obat, deskripsi, dosis, is_active, created_at
)
VALUES
  (
    1,
    'Rifampisin',
    'KDT',
    'Lini Pertama',
    'Obat anti TB lini pertama',
    '300',
    true,
    NOW()
  ),
  (
    2,
    'Isoniazid',
    'KDT',
    'Lini Pertama',
    'Obat anti TB lini pertama',
    '300',
    true,
    NOW()
  ),
  (
    3,
    'Pyrazinamide',
    'KDT',
    'Lini Pertama',
    'Obat anti TB lini pertama',
    '500',
    true,
    NOW()
  ),
  (
    4,
    'Ethambutol',
    'KDT',
    'Lini Pertama',
    'Obat anti TB lini pertama',
    '400',
    true,
    NOW()
  )
ON CONFLICT (id_obat) DO NOTHING;

INSERT INTO episode_pengobatan (
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
  )
ON CONFLICT (id_episode) DO NOTHING;

INSERT INTO pemeriksaan_lab (
  id_tes, id_episode, jenis_tes, tanggal_tes, periode_pemeriksaan,
  jenis_sample, kualitas_sample, dna_bakteri_tb, status_resistensi,
  hasil_tes, hasil_bta, catatan_lab, berkas_pendukung_url, created_at
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
    'Sensitif',
    'P',
    '2+',
    'Hasil TCM menunjukkan beban kuman tinggi',
    'https://example.com/berkas/tcm-siti.pdf',
    NOW()
  )
ON CONFLICT (id_tes) DO NOTHING;

INSERT INTO pemeriksaan_klinis (
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
  )
ON CONFLICT (id_periksa) DO NOTHING;

INSERT INTO diagnosis (
  id_diagnosis, id_episode, tanggal_diagnosis, klasifikasi_anatomi,
  lokasi_anatomi, klasifikasi_resistensi, tipe_resistensi,
  dasar_diagnosis, catatan_klinis, created_at
)
VALUES
  (
    1,
    1,
    '2025-01-12',
    'TB Paru',
    NULL,
    'TB-SO',
    NULL,
    'Terkonfirmasi Bakteriologis (TCM/BTA+)',
    'Pasien terdiagnosis TB paru dengan gejala klasik dan hasil TCM positif',
    NOW()
  )
ON CONFLICT (id_diagnosis) DO NOTHING;