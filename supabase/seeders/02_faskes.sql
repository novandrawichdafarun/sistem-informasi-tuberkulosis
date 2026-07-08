INSERT INTO public.faskes (id, nama_faskes, jenis_faskes, alamat)
VALUES
  ('99999999-9999-9999-9999-999999999999', 'Puskesmas Klampis Ngasem', 'Puskesmas', 'Jl. Klampis Anom No.14, Sukolilo, Surabaya')
ON CONFLICT (id) DO NOTHING;