export interface CreatePasienPayload {
  nama_lengkap: string;
  nik: string;
  email: string;
  password: string;
  no_rm: string; // Nomor Rekam Medis
  tanggal_lahir: string; // Format: YYYY-MM-DD
  jenis_kelamin: "L" | "P";
  alamat: string;
  no_telp: string;
}

export interface UpdatePasienPayload {
  id_pasien: number;
  id_user: string;
  nama_lengkap: string;
  nik: string;
  email: string;
  password?: string;
  no_rm: string; // Nomor Rekam Medis
  tanggal_lahir: string; // Format: YYYY-MM-DD
  jenis_kelamin: "L" | "P";
  alamat: string;
  no_telp: string;
}

export interface PasienData {
  id_pasien: number;
  id_user: string;
  no_rm: string; // Nomor Rekam Medis
  nik: string;
  nama_lengkap: string;
  tanggal_lahir: string;
  jenis_kelamin: "L" | "P";
  alamat: string;
  no_telp: string;
  created_at: string;

  users?: {
    email: string;
  };
}
