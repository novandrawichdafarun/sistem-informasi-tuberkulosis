export interface ObatData {
  id_obat: number;
  nama_obat: string;
  jenis_obat: string | null;
  kategori_obat: string | null;
  deskripsi: string | null;
  dosis: string | null;
  is_active: boolean;
  created_at: string;
}

export interface CreateObatPayload {
  nama_obat: string;
  jenis_obat?: string;
  kategori_obat?: string;
  dosis?: string;
  deskripsi?: string;
  is_active: boolean;
}

export interface UpdateObatPayload extends CreateObatPayload {
  id_obat: number;
}

export type ObatFormValues = {
  jumlah_per_minum: string;
  frekuensi_minum: string;
  aturan_pakai: string;
  tanggal_mulai_obat: string;
  tanggal_selesai_obat: string;
  jam_jadwal: string;
};
