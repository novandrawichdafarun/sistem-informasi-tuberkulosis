import { RingkasanKepatuhan } from "./laporan";
import { PemeriksaanKlinisData } from "./pemeriksaanKlinis";
import { PemeriksaanLabData } from "./pemeriksaanLab";

export interface CreatePasienPayload {
  email: string;
  password: string;
  nama_lengkap: string;
  usia: string;
  jenis_kelamin: "L" | "P";
  domisili: string;
  no_telp: string;
  pendidikan: string;
  pekerjaan: string;
  pendapatan: string;
}

export interface UpdatePasienPayload {
  id_pasien: number;
  id_user: string;
  email: string;
  password?: string;
  nama_lengkap: string;
  usia: string;
  jenis_kelamin: "L" | "P";
  domisili: string;
  no_telp: string;
  pendidikan: string;
  pekerjaan: string;
  pendapatan: string;
}

export interface PasienData {
  id_pasien: number;
  id_user: string;
  nama_lengkap: string;
  usia: string;
  jenis_kelamin: "L" | "P";
  domisili: string;
  no_telp: string;
  pendidikan: string;
  pekerjaan: string;
  pendapatan: string;
  created_at: string;

  users?: {
    email: string;
  };
}

export interface PasienProfile {
  id_pasien: number;
  id_user: string;
  nama_lengkap: string;
  usia: string | null;
  jenis_kelamin: "L" | "P";
  domisili: string | null;
  no_telp: string | null;
  pendidikan: string | null;
  pekerjaan: string | null;
  pendapatan: string | null;
  episodeAktif: {
    id_episode: number;
    tanggal_mulai: string;
    tipe_pasien: string | null;
    status_episode: string;
  } | null;
}

export interface EpisodeRingkas {
  id_episode: number;
  tanggal_mulai: string | null;
  tanggal_selesai: string | null;
  tipe_pasien: string | null;
  status_episode: string;
}

export interface PasienDetail {
  profil: PasienData;
  episodes: EpisodeRingkas[];
  klinis: PemeriksaanKlinisData[];
  lab: PemeriksaanLabData[];
  kepatuhan: RingkasanKepatuhan;
}

export interface EpisodeRingkas {
  id_episode: number;
  tanggal_mulai: string | null;
  tanggal_selesai: string | null;
  tipe_pasien: string | null;
  status_episode: string;
}
