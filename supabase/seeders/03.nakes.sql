INSERT INTO public.nakes (id_user, id_faskes, nama_lengkap, nomor_sip, jabatan)
VALUES
  ('11111111-1111-1111-1111-111111111111', '99999999-9999-9999-9999-999999999999', 'dr. Budi Setiawan, Sp.P', 'SIP/2026/00432/DISKES', 'Dokter Spesialis Paru')
ON CONFLICT (id_user) DO NOTHING;