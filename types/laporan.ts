export type StatusLaporanInput = "diminum" | "ditunda";
export type StatusLaporanFinal = "diminum" | "ditunda" | "terlewat";
export type ReporterRole = "pasien" | "pendamping" | "nakes";

export interface LaporanObatPayload {
  id_jadwal: number;
  status_input: StatusLaporanInput;
  catatan_kepatuhan?: string;
  reported_by: ReporterRole;
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
