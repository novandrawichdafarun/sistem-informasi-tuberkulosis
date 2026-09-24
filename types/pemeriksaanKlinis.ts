export interface PemeriksaanKlinisData {
  id_periksa: number;
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
  nama_lengkap: string;
  jenis_kelamin: "L" | "P";
  usia: string;
  domisili: string;
  episodeAktif: { id_episode: number; status_episode: string } | null;
  riwayat_pemeriksaan: PemeriksaanKlinisData[];
}
