export interface DetailObatData {
  id_detail_obat: number;
  jumlah_obat_per_minum: number | null;
  frekuensi_minum: string | null;
  aturan_pakai: string | null;
  obat: { nama_obat: string; dosis: string | null } | null;
}

export interface JadwalMinumObatData {
  id_jadwal: number;
  id_detail_obat: number;
  tanggal_jadwal: string;
  jam_jadwal: string;
}

export interface ResepData {
  id_resep: number;
  id_episode: number;
  tanggal_resep: string | null;
  kategori_regimen: string | null;
  fase_pengobatan: string | null;
  tanggal_mulai_obat: string | null;
  durasi_hari: number | null;
  detail_obat: DetailObatData[];
  jadwal_minum_obat: JadwalMinumObatData[];
  jumlahJadwal: number;
  jumlahDiminum: number;
  statusEpisode: string;
}

export interface PasienResepOverview {
  id_pasien: number;
  nama_lengkap: string;
  usia: string | null;
  jenis_kelamin: "L" | "P";
  episodeAktif: { id_episode: number; status_episode: string } | null;
  resepList: ResepData[];
}

export interface CreateResepObatItem {
  id_obat: number;
  jumlah_per_minum: number;
  frekuensi_minum: string;
  aturan_pakai?: string;
  tanggal_mulai_obat: string;
  tanggal_selesai_obat: string;
  jam_jadwal: string[];
  jumlah_total_diberikan: number;
}

export interface CreateResepPayload {
  id_episode: number;
  kategori_regimen: string;
  fase_pengobatan: string;
  obat_items: CreateResepObatItem[];
}
