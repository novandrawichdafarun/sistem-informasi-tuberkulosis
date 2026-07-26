// Disesuaikan dengan skema tabel `pasien` di database live:
// id_pasien, id_user, nama_lengkap, usia, jenis_kelamin, domisili,
// no_telp, pendidikan, pekerjaan, pendapatan, created_at.

export interface CreatePasienPayload {
  email: string;
  password: string;
  nama_lengkap: string;
  usia: string;
  jenis_kelamin: "L" | "P";
  domisili: string;
  no_telp: string;
  pendidikan: string;
  pekerjaan: string;
  pendapatan: string;
}

export interface UpdatePasienPayload {
  id_pasien: number;
  id_user: string;
  email: string;
  password?: string;
  nama_lengkap: string;
  usia: string;
  jenis_kelamin: "L" | "P";
  domisili: string;
  no_telp: string;
  pendidikan: string;
  pekerjaan: string;
  pendapatan: string;
}

export interface PasienData {
  id_pasien: number;
  id_user: string;
  nama_lengkap: string;
  usia: string;
  jenis_kelamin: "L" | "P";
  domisili: string;
  no_telp: string;
  pendidikan: string;
  pekerjaan: string;
  pendapatan: string;
  created_at: string;

  users?: {
    email: string;
  };
}
