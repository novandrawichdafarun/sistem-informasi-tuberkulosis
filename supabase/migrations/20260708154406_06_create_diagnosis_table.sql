CREATE TABLE diagnosis (
  id_diagnosis SERIAL PRIMARY KEY,
  id_episode INTEGER UNIQUE REFERENCES episode_pengobatan(id_episode) ON DELETE CASCADE NOT NULL,
  tanggal_diagnosis DATE NOT NULL,
  
  -- standarisasi Medis
  kode_icd10 VARCHAR(10) DEFAULT 'A15' NOT NULL, -- Kode standar TB: A15.0 (TB Paru), A18.2 (TB Kelenjar)
  klasifikasi_anatomi VARCHAR(50), -- TB Paru, TB Ekstra Paru
  lokasi_anatomi VARCHAR(100), -- Jika Ekstraparu, sebutkan: Kelenjar getah bening / Pleura / Meninges / Tulang
  
  -- Kesimpulan Resistensi (Pondasi penentu jenis regimen obat)
  klasifikasi_resistensi VARCHAR(50) NOT NULL, -- TB-SO (Sensitif Obat) / TB-RO (Resisten Obat) / Terduga TB-RO
  tipe_resistensi VARCHAR(50), -- Monoresisten Rifampisin (TB-RR) / MDR-TB / XDR-TB / Null jika SO

  dasar_diagnosis VARCHAR(50), -- Terkonfirmasi Bakteriologis (TCM/BTA+) / Terdiagnosis Klinis (Gejala + Rontgen) 
  catatan_klinis text, -- Catatan tambahan dokter terkait kondisi komorbid seperti TB-HIV atau TB-DM
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX idx_diagnosis_episode ON diagnosis(id_episode);
ALTER TABLE diagnosis ENABLE ROW LEVEL SECURITY;