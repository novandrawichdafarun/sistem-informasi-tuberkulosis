// Disesuaikan dengan skema live: kolom periode_pemeriksaan (bukan periode_bulanan),
// dan tanpa id_nakes.

export interface PemeriksaanLabData {
  id_tes: number;
  id_episode: number;
  jenis_tes: string;
  tanggal_tes: string;
  hasil_tes: string;
  periode_pemeriksaan?: string | null;
  berkas_pendukung_url?: string | null;
  created_at: string;
}

export interface CreatePemeriksaanLabPayload {
  id_episode: number;
  jenis_tes: string;
  tanggal_tes: string;
  hasil_tes: string;
  periode_pemeriksaan?: string;
  berkas_pendukung_url?: string;
}

export interface UpdatePemeriksaanLabPayload extends CreatePemeriksaanLabPayload {
  id_tes: number;
}

export interface PasienPemeriksaanLabOverview {
  id_pasien: number;
  nama_lengkap: string;
  usia: string | null;
  jenis_kelamin: "L" | "P";
  episodeAktif: { id_episode: number; status_episode: string } | null;
  riwayat_pemeriksaan_lab: PemeriksaanLabData[];
}
