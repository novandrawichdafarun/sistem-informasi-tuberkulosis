export interface DetailObatData {
  id_detail_obat: number;
  jumlah_obat_per_minum: number | null;
  frekuensi_minum: string | null;
  aturan_pakai: string | null;
  obat: { nama_obat: string; dosis: string | null } | null;
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

export interface CreateResepPayload {
  id_episode: number;
  kategori_regimen: string;
  fase_pengobatan: string;
  tanggal_mulai_obat: string;
  durasi_hari: number;
  jam_jadwal: string;
  obat_ids: number[];
  jumlah_per_minum: number;
  aturan_pakai?: string;
}
