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
  id_episode: number;
  id_pasien: number;
  nama_lengkap: string;
  usia: string;
  jenis_kelamin: string;
  domisili: string;
  no_telp: string;
  pendidikan: string;
  pekerjaan: string;
  pendapatan: string;
  tanggal_mulai: string | Date;
  tanggal_selesai: string | Date;
  tipe_pasien: string;
  status_episode: string;
  status_akhir: string | null;
}

export interface KlinisData {
  nama_lengkap: string;
  id_periksa: number;
  id_episode: number;
  tanggal_periksa: string | Date;
  keluhan: string | null;
  tensi: string | null;
  suhu: string | null;
  pernapasan: number | null;
  nadi: number | null;
  saturaswi_o2: number | null;
  tinggi_badan: number | null;
  berat_badan: number | null;
}

export interface LabData {
  nama_lengkap: string;
  id_tes: number;
  id_episode: number;
  jenis_tes: string;
  tanggal_tes: string | Date;
  periode_pemeriksaan: string;
  jenis_sample: string | null;
  kualitas_sample: string | null;
  dna_bakteri_tb: string;
  hasil_tes: string;
  hasil_bta: string | null;
  catatan_lab: string | null;
}

export interface DiagnosisData {
  nama_lengkap: string;
  id_diagnosis: number;
  id_episode: number;
  tanggal_diagnosis: string | Date;
  klasifikasi_anatomi: string;
  lokasi_anatomi: string | null;
  dasar_diagnosis: string | null;
  catatan_klinis: string | null;
}

export interface MakanData {
  nama_lengkap: string;
  id_laporan: number;
  id_episode: number;
  waktu_makan: string | Date;
  karbo: string;
  protein: string;
  serat: string;
  catatan: string | null;
}

export interface ObatData {
  nama_lengkap: string;
  id_log: number;
  id_jadwal: number;
  tanggal_jadwal: string | Date;
  jam_jadwal: string;
  nama_obat: string;
  aturan_pakai: string;
  status: string;
  reported_at: string;
  reported_by: string;
  catatan_kepatuhan: string | null;
}

export interface ComprehensiveExportData {
  pasienEpisode?: PasienEpisodeData[];
  klinis?: KlinisData[];
  lab?: LabData[];
  diagnosis?: DiagnosisData[];
  makan?: MakanData[];
  obat?: ObatData[];
}
