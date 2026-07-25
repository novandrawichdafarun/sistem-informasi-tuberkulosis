import { PemeriksaanKlinisData } from "./pemeriksaanKlinis";
import { PemeriksaanLabData } from "./pemeriksaanLab";

// Re-export supaya halaman pasien cukup import dari satu tempat.
export type { PemeriksaanKlinisData, PemeriksaanLabData };

export interface PasienPortalProfile {
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

export type MedicationStatus = "diminum" | "terlewat";

export interface MedicationToday {
  id_jadwal: number;
  tanggal_jadwal: string;
  jam_jadwal: string;
  status: MedicationStatus | null; // null = belum dilaporkan
  reported_at: string | null;
  obat: { nama_obat: string; dosis: string }[];
}

export interface AdherenceDay {
  tanggal: string; // YYYY-MM-DD
  jam_jadwal: string;
  status: MedicationStatus | null; // null = belum dilaporkan
  reported_at: string | null;
}

export interface AdherenceSummary {
  total: number;
  diminum: number;
  terlewat: number;
  belum: number;
  persentase: number;
  days: AdherenceDay[];
}

export interface ChatMessage {
  id_pesan: number;
  id_pengirim: string;
  isi_pesan: string;
  waktu_kirim: string;
  status_baca: string;
  fromMe: boolean;
}
