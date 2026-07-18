export interface PemeriksaanKlinisData {
  id_periksa: number;
  id_episode: number;
  id_nakes: number;
  tanggal_periksa: string;
  keluhan?: string | null;
  tensi?: string | null;
  suhu?: number | null;
  pernapasan?: number | null;
  nadi?: number | null;
  saturasi_o2?: number | null;
  tinggi_badan?: number | null;
  berat_badan?: number | null;
  created_at: string;
}

export interface CreatePemeriksaanPayload {
  id_episode: number;
  tanggal_periksa: string;
  keluhan?: string;
  tensi?: string;
  suhu?: number;
  pernapasan?: number;
  nadi?: number;
  saturasi_o2?: number;
  tinggi_badan?: number;
  berat_badan?: number;
}

export interface UpdatePemeriksaanPayload extends CreatePemeriksaanPayload {
  id_periksa: number;
}

export interface PasienPemeriksaanOverview {
  id_pasien: number;
  no_rm: string;
  nama_lengkap: string;
  nik: string;
  episodeAktif: { id_episode: number; status_episode: string } | null;
  riwayat_pemeriksaan: PemeriksaanKlinisData[];
}
