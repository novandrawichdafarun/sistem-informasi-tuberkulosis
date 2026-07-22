export interface EpisodePengobatanData {
  id_episode: number;
  id_pasien: number;
  tanggal_mulai: string; // Format: YYYY-MM-DD
  tanggal_selesai: string | null;
  tipe_pasien: string; // Positif TB / Negatif TB / dll
  status_episode: "aktif" | "selesai";
  created_at: string;
}

export interface PasienEpisodeOverview {
  id_pasien: number;
  nama_lengkap: string;
  usia: string;
  domisili: string;
  episodeAktif: EpisodePengobatanData | null;
  riwayat_episode: EpisodePengobatanData[];
}

export interface BukaEpisodePayload {
  id_pasien: number;
  tanggal_mulai: string; // Format: YYYY-MM-DD
  tipe_pasien: string;
}

export interface TutupEpisodePayload {
  id_episode: number;
  tanggal_selesai: string; // Format: YYYY-MM-DD
  tipe_pasien: string;
}

export interface EditEpisodePayload {
  id_episode: number;
  tanggal_mulai: string;
  tanggal_selesai?: string | null;
  tipe_pasien: string;
}
