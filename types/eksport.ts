export interface ExportFilters {
  pasienIds?: number[]; // Kosong berarti semua pasien
  startDate: string;
  endDate: string;
  selectedModules: {
    pasienEpisode: boolean;
    klinis: boolean;
    lab: boolean;
    diagnosis: boolean;
    makan: boolean;
    obat: boolean;
  };
}

export interface PasienEpisodeData {
  id_pasien: number;
  nama_lengkap: string;
  usia: string;
  jenis_kelamin: string;
  id_episode: number;
  tanggal_mulai: string | Date;
  tanggal_selesai: string | Date;
  status_akhir: string | null;
}

export interface KlinisData {
  nama_lengkap: string;
  id_periksa: number;
  id_episode: number;
  tanggal_periksa: string | Date;
  keluhan: string | null;
  tensi: string | null;
  berat_badan: number | null;
}

export interface LabData {
  nama_lengkap: string;
  id_tes: number;
  id_episode: number;
  jenis_tes: string;
  tanggal_tes: string | Date;
  hasil_tes: string;
  hasil_bta: string | null;
}

export interface DiagnosisData {
  nama_lengkap: string;
  id_diagnosis: number;
  id_episode: number;
  tanggal_diagnosis: string | Date;
  klasifikasi_anatomi: string;
  lokasi_anatomi: string | null;
}

export interface MakanData {
  nama_lengkap: string;
  id_laporan: number;
  id_episode: number;
  waktu_makan: string | Date;
  karbo: string;
  protein: string;
  serat: string;
}

export interface ObatData {
  nama_lengkap: string;
  id_jadwal: number;
  tanggal_jadwal: string | Date;
  jam_jadwal: string;
  nama_obat: string;
  aturan_pakai: string;
  status_kepatuhan: string | null;
}

export interface ComprehensiveExportData {
  pasienEpisode?: PasienEpisodeData[];
  klinis?: KlinisData[];
  lab?: LabData[];
  diagnosis?: DiagnosisData[];
  makan?: MakanData[];
  obat?: ObatData[];
}
