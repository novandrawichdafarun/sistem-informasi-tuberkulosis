export interface ObatData {
  id_obat: number;
  nama_obat: string;
  jenis_obat: string;
  kategori_obat: string;

  deskripsi?: string | null;
  dosis?: string | null;
  is_active: boolean;
  created_at: string;
}

export interface createObatPayload {
  nama_obat: string;
  jenis_obat: string;
  kategori_obat: string;

  deskripsi?: string | null;
  dosis?: string | null;
}

export interface UpdateObatPayload extends createObatPayload {
  id_obat: number;
}
