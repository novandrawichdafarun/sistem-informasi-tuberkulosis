-- =========================================================================
-- 1. SEED DATA TABEL auth.users & auth.identities
-- =========================================================================

INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password, 
  email_confirmed_at, recovery_sent_at, last_sign_in_at, 
  raw_app_meta_data, raw_user_meta_data, is_super_admin, 
  created_at, updated_at, phone, phone_confirmed_at
)
VALUES
  (
    '00000000-0000-0000-0000-000000000000', 
    '11111111-1111-1111-1111-111111111111', -- ID Unik User 1 (Dokter)
    'authenticated', 'authenticated', 'dr.budi@faskes.go.id', 
    '$2a$10$7v1bSWRGv1zR9EaFkKvxbeK6J9bA5q2rPTe5O1C2mG3eWvN7L6BQi', 
    NOW(), NULL, NOW(), 
    '{"provider":"email","providers":["email"]}', '{"role":"nakes"}', 
    FALSE, NOW(), NOW(), NULL, NULL
  ),
  (
    '00000000-0000-0000-0000-000000000000', 
    '22222222-2222-2222-2222-222222222222', -- ID Unik User 2 (Pasien)
    'authenticated', 'authenticated', 'budi.pasien@gmail.com', 
    '$2a$10$7v1bSWRGv1zR9EaFkKvxbeK6J9bA5q2rPTe5O1C2mG3eWvN7L6BQi', 
    NOW(), NULL, NOW(), 
    '{"provider":"email","providers":["email"]}', '{"role":"pasien"}', 
    FALSE, NOW(), NOW(), NULL, NULL
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (
  id, provider_id, user_id, identity_data, provider, 
  last_sign_in_at, created_at, updated_at
)
VALUES
  (
    gen_random_uuid(), -- ID unik untuk baris identitas
    '11111111-1111-1111-1111-111111111111', -- provider_id biasanya sama dengan user_id untuk email
    '11111111-1111-1111-1111-111111111111', 
    '{"sub":"11111111-1111-1111-1111-111111111111","email":"dr.budi@faskes.go.id"}', 
    'email', NOW(), NOW(), NOW()
  ),
  (
    gen_random_uuid(), 
    '22222222-2222-2222-2222-222222222222', 
    '22222222-2222-2222-2222-222222222222', 
    '{"sub":"22222222-2222-2222-2222-222222222222","email":"budi.pasien@gmail.com"}', 
    'email', NOW(), NOW(), NOW()
  )
ON CONFLICT (provider_id, provider) DO NOTHING;

-- =========================================================================
-- 2. SEED DATA TABEL public.users (Profil Akun Dasar)
-- =========================================================================

INSERT INTO public.users (id, email, created_at)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'dr.budi@faskes.go.id', NOW()),
  ('22222222-2222-2222-2222-222222222222', 'budi.pasien@gmail.com', NOW())
ON CONFLICT (id) DO NOTHING;


-- =========================================================================
-- 3. SEED DATA TABEL public.faskes (Fasilitas Kesehatan)
-- =========================================================================
INSERT INTO public.faskes (id, nama_faskes, jenis_faskes, alamat)
VALUES
  ('99999999-9999-9999-9999-999999999999', 'Puskesmas Klampis Ngasem', 'Puskesmas', 'Jl. Klampis Anom No.14, Sukolilo, Surabaya')
ON CONFLICT (id) DO NOTHING;

-- =========================================================================
-- 4. SEED DATA TABEL public.nakes (Tenaga Kesehatan)
-- =========================================================================
INSERT INTO public.nakes (id_user, id_faskes, nama_lengkap, nomor_sip, jabatan)
VALUES
  ('11111111-1111-1111-1111-111111111111', '99999999-9999-9999-9999-999999999999', 'dr. Budi Setiawan, Sp.P', 'SIP/2026/00432/DISKES', 'Dokter Spesialis Paru')
ON CONFLICT (id_user) DO NOTHING;

-- =========================================================================
-- 5. SEED DATA TABEL public.pasien (Data Medis Pasien TB)
-- =========================================================================
INSERT INTO public.pasien (id_user, id_faskes, nama_lengkap, nomor_nik, tanggal_lahir, jenis_kelamin, nomor_hp, alamat_domisili)
VALUES
  ('22222222-2222-2222-2222-222222222222', '99999999-9999-9999-9999-999999999999', 'Budi Santoso', '3578012345670001', '1995-08-17', 'Laki-laki', '081234567890', 'Jl. Menur Pumpungan No.10, Surabaya')
ON CONFLICT (id_user) DO NOTHING;
