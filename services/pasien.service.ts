import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import {
  CreatePasienPayload,
  PasienData,
  UpdatePasienPayload,
} from "@/types/pasien";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export const getPasienByNakesId = async (id_user_nakes: string) => {
  const { data: nakes, error: nakesError } = await supabase
    .from("nakes")
    .select("id_nakes")
    .eq("id_user", id_user_nakes)
    .single();

  if (nakesError || !nakes) {
    return {
      success: false,
      message: "Data Tenaga Kesehatan tidak ditemukan.",
    };
  }

  const { data: pasien, error: pasienError } = await supabase
    .from("pasien")
    .select(
      `
      id_pasien, id_user, no_rm, nik, nama_lengkap, jenis_kelamin, tanggal_lahir,
      alamat, no_telp, tinggi_badan_awal, berat_badan_awal, created_at,
      users ( email )
    `,
    )
    .eq("id_nakes", nakes.id_nakes)
    .order("created_at", { ascending: false });

  if (pasienError) {
    return { success: false, message: "Gagal mengambil data pasien." };
  }

  return { success: true, data: pasien as unknown as PasienData[] };
};

export const createPasien = async (
  payload: CreatePasienPayload,
  id_user_nakes: string,
) => {
  const { data: nakes, error: nakesError } = await supabase
    .from("nakes")
    .select("id_nakes, id_faskes")
    .eq("id_user", id_user_nakes)
    .single();

  if (nakesError || !nakes) {
    return { success: false, message: "Otoritas Nakes tidak valid." };
  }

  const { data: existingUser } = await supabase
    .from("users")
    .select("id_user")
    .eq("email", payload.email)
    .single();
  if (existingUser)
    return { success: false, message: "Email sudah terdaftar!" };

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(payload.password, salt);

  const { data: newUser, error: userError } = await supabase
    .from("users")
    .insert({
      email: payload.email,
      password_hash: hashedPassword,
      role: "pasien",
    })
    .select("id_user")
    .single();

  if (userError || !newUser) {
    return { success: false, message: "Gagal membuat kredensial akun pasien." };
  }

  const { error: pasienError } = await supabase.from("pasien").insert({
    id_user: newUser.id_user,
    id_nakes: nakes.id_nakes,
    id_faskes: nakes.id_faskes,
    no_rm: payload.no_rm,
    nik: payload.nik,
    nama_lengkap: payload.nama_lengkap,
    tanggal_lahir: payload.tanggal_lahir,
    jenis_kelamin: payload.jenis_kelamin,
    alamat: payload.alamat,
    no_telp: payload.no_telp,
    tinggi_badan_awal: payload.tinggi_badan_awal,
    berat_badan_awal: payload.berat_badan_awal,
  });

  if (pasienError) {
    await supabase.from("users").delete().eq("id_user", newUser.id_user);
    return {
      success: false,
      message: "Gagal menyimpan data medis pasien. Pendaftaran dibatalkan.",
    };
  }

  return { success: true, message: "Pasien berhasil didaftarkan!" };
};

export const updatePasien = async (
  payload: UpdatePasienPayload,
  id_user_nakes: string,
) => {
  const { data: nakes } = await supabase
    .from("nakes")
    .select("id_nakes")
    .eq("id_user", id_user_nakes)
    .single();
  if (!nakes) return { success: false, message: "Otoritas tidak valid." };

  const updateUserData: { email: string; password_hash?: string } = {
    email: payload.email,
  };

  if (payload.password && payload.password.trim() !== "") {
    const salt = await bcrypt.genSalt(10);
    updateUserData.password_hash = await bcrypt.hash(payload.password, salt);
  }

  const { error: userError } = await supabase
    .from("users")
    .update(updateUserData)
    .eq("id_user", payload.id_user);

  if (userError) {
    console.error("ERROR UPDATE USER:", userError);
    return {
      success: false,
      message:
        "Gagal memperbarui email/sandi pasien (Email mungkin sudah dipakai).",
    };
  }

  const { error: pasienError } = await supabase
    .from("pasien")
    .update({
      nama_lengkap: payload.nama_lengkap,
      nik: payload.nik,
      no_rm: payload.no_rm,
      tanggal_lahir: payload.tanggal_lahir,
      jenis_kelamin: payload.jenis_kelamin,
      alamat: payload.alamat,
      no_telp: payload.no_telp,
      tinggi_badan_awal: payload.tinggi_badan_awal,
      berat_badan_awal: payload.berat_badan_awal,
    })
    .eq("id_pasien", payload.id_pasien)
    .eq("id_nakes", nakes.id_nakes);

  if (pasienError)
    return {
      success: false,
      message: "Gagal memperbarui profil medis pasien.",
    };

  return {
    success: true,
    message: "Data pasien dan akun berhasil diperbarui!",
  };
};

export const deletePasien = async (
  id_pasien: number,
  id_user_nakes: string,
) => {
  const { data: nakes } = await supabase
    .from("nakes")
    .select("id_nakes")
    .eq("id_user", id_user_nakes)
    .single();
  if (!nakes) return { success: false, message: "Otoritas tidak valid." };

  const { data: pasien } = await supabase
    .from("pasien")
    .select("*")
    .eq("id_pasien", id_pasien)
    .eq("id_nakes", nakes.id_nakes)
    .single();

  if (!pasien)
    return {
      success: false,
      message: "Pasien tidak ditemukan atau bukan milik Anda.",
    };

  const { error: deletePasienError } = await supabase
    .from("pasien")
    .delete()
    .eq("id_pasien", id_pasien);

  if (deletePasienError) {
    console.error("ERROR DELETE PASIEN:", deletePasienError);
    return { success: false, message: "Gagal menghapus data medis pasien." };
  }

  const { error: deleteUserError } = await supabase
    .from("users")
    .delete()
    .eq("id_user", pasien.id_user);

  if (deleteUserError) {
    console.error("ERROR DELETE USER:", deleteUserError);

    await supabase.from("pasien").insert(pasien);

    return {
      success: false,
      message:
        "Gagal menghapus data akun. Sistem otomatis membatalkan seluruh penghapusan.",
    };
  }

  return {
    success: true,
    message: "Pasien dan akunnya berhasil dihapus permanen.",
  };
};
