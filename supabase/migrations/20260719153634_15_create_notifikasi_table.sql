CREATE TABLE notifikasi (
  id_notifikasi SERIAL PRIMARY KEY,
  id_user UUID REFERENCES users(id_user) ON DELETE CASCADE NOT NULL, -- Penerima notifikasi
  judul VARCHAR(100) NOT NULL,
  pesan TEXT NOT NULL,
  waktu_kirim TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX idx_notifikasi_id_user ON notifikasi(id_user);
CREATE INDEX idx_notifikasi_waktu_kirim ON notifikasi(waktu_kirim);
CREATE INDEX idx_notifikasi_created_at ON notifikasi(created_at);
ALTER TABLE notifikasi ENABLE ROW LEVEL SECURITY;q