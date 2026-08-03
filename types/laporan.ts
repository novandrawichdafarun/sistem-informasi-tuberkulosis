export type StatusLaporanInput = "diminum" | "ditunda";
export type StatusLaporanFinal = "diminum" | "ditunda" | "terlewat";
export type ReporterRole = "pasien" | "pendamping" | "nakes";

export interface LaporanObatPayload {
  id_jadwal: number;
  status_input: StatusLaporanInput;
  catatan_kepatuhan?: string;
  reported_by: ReporterRole;
}

export interface LaporanMakanPayload {
  karbo: string;
  protein: string;
  serat: string;
  catatan?: string;
}

export interface LaporanMakanData {
  id_laporan: number;
  id_pasien: number;
  waktu_makan: string;
  karbo: string;
  protein: string;
  serat: string;
  catatan: string | null;
  reported_at: string;
}

export interface LaporanMakanPasienOverview {
  id_pasien: number;
  nama_pasien: string;
  jenis_kelamin: "L" | "P" | null;
  total: number;
  terakhir: string | null; // waktu_makan terbaru
  laporan: LaporanMakanData[];
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
    status: StatusLaporanFinal;
    catatan_kepatuhan: string | null;
  } | null;
}

export interface KepatuhanHarian {
  tanggal: string; // YYYY-MM-DD
  jam_jadwal: string;
  status: StatusLaporanFinal | null; // null = belum dilaporkan
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
