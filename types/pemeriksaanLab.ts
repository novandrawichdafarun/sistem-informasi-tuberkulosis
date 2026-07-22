export interface PemeriksaanLabData {
  id_tes: number;
  id_episode: number;
  jenis_tes: string;
  tanggal_tes: string;
  periode_pemeriksaan: string;

  jenis_sample?: string | null;
  kualitas_sample?: string | null;

  dna_bakteri_tb: string;
  status_resistensi: string;

  hasil_tes: string;
  hasil_bta?: string | null;
  berkas_pendukung_url?: string | null;
  created_at: string;
}

export interface CreatePemeriksaanLabPayload {
  id_episode: number;
  jenis_tes: string;
  tanggal_tes: string;
  periode_pemeriksaan: string;

  jenis_sample?: string | null;
  kualitas_sampl?: string | null;

  dna_bakteri_tb: string;
  status_resistensi: string;

  hasil_tes: string;
  hasil_bta?: string | null;
  berkas_pendukung_url?: string; //! Nanti bisa digunakan jika fitur upload file ditambahkan
}

export interface UpdatePemeriksaanLabPayload extends CreatePemeriksaanLabPayload {
  id_tes: number;
}

export interface PasienPemeriksaanLabOverview {
  id_pasien: number;
  nama_lengkap: string;
  usia: string;
  domisili: string;
  episodeAktif: { id_episode: number; status_episode: string } | null;
  riwayat_pemeriksaan_lab: PemeriksaanLabData[];
}
