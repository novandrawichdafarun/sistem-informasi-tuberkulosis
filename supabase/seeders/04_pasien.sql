INSERT INTO public.pasien (id_user, id_faskes, nama_lengkap, nomor_nik, tanggal_lahir, jenis_kelamin, nomor_hp, alamat_domisili)
VALUES
  ('22222222-2222-2222-2222-222222222222', '99999999-9999-9999-9999-999999999999', 'Budi Santoso', '3578012345670001', '1995-08-17', 'Laki-laki', '081234567890', 'Jl. Menur Pumpungan No.10, Surabaya')
ON CONFLICT (id_user) DO NOTHING;