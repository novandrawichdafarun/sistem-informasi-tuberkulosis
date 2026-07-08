CREATE TABLE medication_log (
  id_log SERIAL PRIMARY KEY,
  id_jadwal INTEGER UNIQUE REFERENCES jadwal_minum_obat(id_jadwal) ON DELETE CASCADE NOT NULL,
  status VARCHAR(20) CHECK (status IN ('diminum', 'terlewat')) NOT NULL,
  catatan_efek_samping TEXT,
  bukti_foto_url VARCHAR(255),
  reported_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  reported_by VARCHAR(20) CHECK (reported_by IN ('pasien', 'pendamping')) NOT NULL
);

ALTER TABLE medication_log ENABLE ROW LEVEL SECURITY;