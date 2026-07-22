CREATE TABLE medication_log (
  id_log SERIAL PRIMARY KEY,
  id_jadwal INTEGER UNIQUE REFERENCES jadwal_minum_obat(id_jadwal) ON DELETE CASCADE NOT NULL,
  status VARCHAR(20) CHECK (status IN ('diminum', 'terlewat', 'ditunda')) NOT NULL,
  catatan_kepatuhan TEXT,
  reported_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  reported_by VARCHAR(20) CHECK (reported_by IN ('pasien', 'pendamping', 'nakes')) NOT NULL
);

CREATE INDEX idx_medication_log_jadwal ON medication_log(id_jadwal);
ALTER TABLE medication_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pasien kelola log sendiri" ON medication_log
  FOR ALL TO authenticated USING (
    id_jadwal IN (
      SELECT id_jadwal FROM jadwal_minum_obat j
      JOIN resep_pengobatan r ON j.id_resep = r.id_resep
      JOIN episode_pengobatan e ON r.id_episode = e.id_episode
      JOIN pasien p ON e.id_pasien = p.id_pasien
      WHERE p.id_user = auth.uid()
    )
  );