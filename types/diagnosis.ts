export interface DiagnosisData {
  id_diagnosis: number;
  id_episode: number;
  tanggal_diagnosis: string;

  kode_icd10: string;
  klasifikasi_anatomi?: string | null;
  lokasi_anatomi?: string | null;

  klasifikasi_resistensi: string;
  tipe_resistensi?: string | null;

  dasar_diagnosis?: string | null;
  catatan_klinis?: string | null;
  created_at: string;
}

export interface CreateDiagnosisPayload {
  id_episode: number;
  tanggal_diagnosis: string;

  kode_icd10: string;
  klasifikasi_anatomi?: string | null;
  lokasi_anatomi?: string | null;

  klasifikasi_resistensi: string;
  tipe_resistensi?: string | null;

  dasar_diagnosis?: string | null;
  catatan_klinis?: string | null;
}

export interface UpdateDaignosisPayload extends CreateDiagnosisPayload {
  id_diagnosis: number;
}

export interface PasienDiagnosisOverview {
  id_pasien: number;
  nama_lengkap: string;
  usia: string;
  domisili: string;
  episodeAktif: { id_episode: number; status_episode: string } | null;
  riwayat_diagnosis: DiagnosisData[];
}
