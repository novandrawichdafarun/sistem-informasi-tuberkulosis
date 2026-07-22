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