export type StatusLaporan = "diminum" | "terlewat";
export type ReporterRole = "pasien" | "pendamping" | "nakes";

export interface LaporanObatPayload {
  id_jadwal: number;
  catatan_kepatuhan?: string;
  reported_by: ReporterRole;
}

export interface LaporanMakanPayload {
  id_episode: number;
  karbo: string;
  protein: string;
  serat: string;
  catatan?: string;
}

export interface LaporanMakanData {
  id_laporan: number;
  id_episode: number;
  waktu_makan: string;
  karbo: string;
  protein: string;
  serat: string;
  catatan: string | null;
  reported_at: string;
}

export interface LaporanMakanPasienOverview {
  id_pasien: number;
  nama_lengkap: string;
  jenis_kelamin: "L" | "P";
  total: number;
  terakhir: string | null; // waktu_makan terbaru
  episodeAktif?: { id_episode: number; status_episode: string } | null;
  riwayat: LaporanMakanData[];
}

export interface JadwalObatHariIni {
  id_jadwal: number;
  tanggal_jadwal: string;
  jam_jadwal: string;
  detail_obat: {
    jumlah_obat_per_minum: number;
    aturan_pakai: string;
    obat: {
      nama_obat: string;
    };
  };
  // medication_log bisa null jika pasien belum melakukan pelaporan
  medication_log: {
    id_log: number;
    status: StatusLaporan;
    catatan_kepatuhan: string | null;
  } | null;
}

export interface KepatuhanHarian {
  tanggal: string; // YYYY-MM-DD
  jam_jadwal: string;
  status: StatusLaporan | null; // null = belum dilaporkan
  reported_at: string | null;
}

export interface RingkasanKepatuhan {
  total: number;
  diminum: number;
  terlewat: number;
  belum: number;
  persentase: number;
  days: KepatuhanHarian[];
}
