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