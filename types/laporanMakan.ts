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

export interface CreateLaporanMakanPayload {
  waktu_makan: string;
  karbo: string;
  protein: string;
  serat: string;
  catatan?: string | null;
}

// Ringkasan laporan makan per pasien (dipakai di tampilan super admin:
// satu baris per pasien + detail seluruh laporannya).
export interface LaporanMakanPasienOverview {
  id_pasien: number;
  nama_pasien: string;
  jenis_kelamin: "L" | "P" | null;
  total: number;
  terakhir: string | null; // waktu_makan terbaru
  laporan: LaporanMakanData[];
}
