CREATE TABLE pesan_chat (
  id_pesan SERIAL PRIMARY KEY,
  id_pasien INTEGER REFERENCES pasien(id_pasien) ON DELETE CASCADE NOT NULL,
  id_pengirim UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  isi_pesan TEXT NOT NULL,
  lampiran_file_url VARCHAR(255),
  waktu_kirim TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  status_baca VARCHAR(20) DEFAULT 'belum dibaca' CHECK (status_baca IN ('dibaca', 'belum dibaca')) NOT NULL
);

ALTER TABLE pesan_chat ENABLE ROW LEVEL SECURITY;