export interface PemeriksaanLabData {
  id_tes: number;
  id_episode: number;
  id_nakes: number;
  jenis_tes: string;
  tanggal_tes: string;
  hasil_tes: string;
  periode_bulanan?: string | null;
  berkas_pendukung_url?: string | null;
  created_at: string;
}

export interface CreatePemeriksaanLabPayload {
  id_episode: number;
  jenis_tes: string;
  tanggal_tes: string;
  hasil_tes: string;
  periode_bulanan?: string;
  berkas_pendukung_url?: string; //! Nanti bisa digunakan jika fitur upload file ditambahkan
}

export interface UpdatePemeriksaanLabPayload extends CreatePemeriksaanLabPayload {
  id_tes: number;
}

export interface PasienPemeriksaanLabOverview {
  id_pasien: number;
  no_rm: string;
  nama_lengkap: string;
  nik: string;
  episodeAktif: { id_episode: number; status_episode: string } | null;
  riwayat_pemeriksaan_lab: PemeriksaanLabData[];
}
