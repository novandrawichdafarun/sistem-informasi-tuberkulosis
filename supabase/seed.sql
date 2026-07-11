-- =========================================================================
-- 1. SEED DATA TABEL users (Profil Akun & Kredensial untuk NextAuth)
-- =========================================================================
-- Catatan: Password untuk kedua user ini adalah "password123" 
-- (sudah di-hash menggunakan Bcrypt)

INSERT INTO users (id_user, email, password_hash, role, created_at)
VALUES
  (
    '11111111-1111-1111-1111-111111111111', 
    'dr.budi@faskes.go.id', 
    '$2a$10$7v1bSWRGv1zR9EaFkKvxbeK6J9bA5q2rPTe5O1C2mG3eWvN7L6BQi', 
    'nakes', 
    NOW()
  ),
  (
    '22222222-2222-2222-2222-222222222222', 
    'budi.pasien@gmail.com', 
    '$2a$10$7v1bSWRGv1zR9EaFkKvxbeK6J9bA5q2rPTe5O1C2mG3eWvN7L6BQi', 
    'pasien', 
    NOW()
  )
ON CONFLICT (id_user) DO NOTHING;


-- =========================================================================
-- 2. SEED DATA TABEL faskes (Fasilitas Kesehatan)
-- =========================================================================

INSERT INTO faskes (id_faskes, nama_faskes, jenis, alamat, created_at)
VALUES
  (
    1, 
    'Puskesmas Klampis Ngasem', 
    'Puskesmas', 
    'Jl. Klampis Anom No.14, Sukolilo, Surabaya',
    NOW()
  )
ON CONFLICT (id_faskes) DO NOTHING;


-- =========================================================================
-- 3. SEED DATA TABEL nakes (Tenaga Kesehatan)
-- =========================================================================

INSERT INTO nakes (id_nakes, id_user, id_faskes, nama, no_str_sip, jabatan, no_hp, created_at)
VALUES
  (
    1,
    '11111111-1111-1111-1111-111111111111', 
    1, -- Merujuk ke id_faskes = 1 (Puskesmas Klampis)
    'dr. Budi Setiawan, Sp.P', 
    'SIP/2026/00432/DISKES', 
    'Dokter Spesialis Paru',
    '081111111111',
    NOW()
  )
ON CONFLICT (id_nakes) DO NOTHING;


-- =========================================================================
-- 4. SEED DATA TABEL pasien (Data Medis Pasien TB)
-- =========================================================================

INSERT INTO pasien (
  id_pasien, id_user, id_nakes, id_faskes, no_rm, nik, 
  nama_lengkap, tanggal_lahir, jenis_kelamin, alamat, no_telp, created_at
)
VALUES
  (
    1,
    '22222222-2222-2222-2222-222222222222', 
    1, -- Merujuk ke id_nakes = 1 (dr. Budi)
    1, -- Merujuk ke id_faskes = 1 (Puskesmas Klampis)
    'RM-2026-001',
    '3578012345670001', 
    'Budi Santoso', 
    '1995-08-17', 
    'L',
    'Jl. Menur Pumpungan No.10, Surabaya',
    '081234567890',
    NOW()
  )
ON CONFLICT (id_pasien) DO NOTHING;