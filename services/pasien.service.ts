import { SupabaseClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import {
  CreatePasienPayload,
  PasienData,
  UpdatePasienPayload,
} from "@/types/pasien";
import { ActionResponse } from "@/types/action";
import { handleServiceError } from "@/utils/error";

// Kolom pasien sesuai skema live (tanpa nakes/faskes/nik/no_rm).
const PASIEN_COLUMNS = `
  id_pasien, id_user, nama_lengkap, usia, jenis_kelamin, domisili,
  no_telp, pendidikan, pekerjaan, pendapatan, created_at,
  users ( email )
`;

export const getAllPasien = async (
  supabase: SupabaseClient,
): Promise<ActionResponse<PasienData[]>> => {
  try {
    const { data: pasien, error } = await supabase
      .from("pasien")
      .select(PASIEN_COLUMNS)
      .order("created_at", { ascending: false });

    if (error) {
      return handleServiceError(
        error,
        "Gagal mengambil data pasien dari sistem.",
      );
    }

    return { success: true, data: pasien as unknown as PasienData[] };
  } catch (error) {
    return handleServiceError(error);
  }
};

export const createPasien = async (
  supabase: SupabaseClient,
  payload: CreatePasienPayload,
): Promise<ActionResponse> => {
  try {
    // Cek duplikasi email
    const { data: existingUser } = await supabase
      .from("users")
      .select("id_user")
      .eq("email", payload.email)
      .single();

    if (existingUser) {
      return { success: false, error: "Email sudah terdaftar di sistem!" };
    }

    // Buat akun login pasien
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
      console.error("[DB ERROR] Insert User:", userError?.message);
      return { success: false, error: "Gagal membuat kredensial akun pasien." };
    }

    // Simpan data demografi pasien
    const { error: pasienError } = await supabase.from("pasien").insert({
      id_user: newUser.id_user,
      nama_lengkap: payload.nama_lengkap,
      usia: payload.usia,
      jenis_kelamin: payload.jenis_kelamin,
      domisili: payload.domisili,
      no_telp: payload.no_telp,
      pendidikan: payload.pendidikan,
      pekerjaan: payload.pekerjaan,
      pendapatan: payload.pendapatan,
    });

    // Rollback manual bila insert pasien gagal
    if (pasienError) {
      await supabase.from("users").delete().eq("id_user", newUser.id_user);
      return handleServiceError(
        pasienError,
        "Gagal menyimpan data pasien. Pendaftaran dibatalkan.",
      );
    }

    return { success: true, message: "Pasien berhasil didaftarkan!" };
  } catch (error) {
    return handleServiceError(error);
  }
};

export const updatePasien = async (
  supabase: SupabaseClient,
  payload: UpdatePasienPayload,
): Promise<ActionResponse> => {
  try {
    // Update kredensial akun
    const updateUserData: { email: string; password_hash?: string } = {
      email: payload.email,
    };

    if (payload.password) {
      const salt = await bcrypt.genSalt(10);
      updateUserData.password_hash = await bcrypt.hash(payload.password, salt);
    }

    const { error: userError } = await supabase
      .from("users")
      .update(updateUserData)
      .eq("id_user", payload.id_user);

    if (userError) {
      console.error("[DB ERROR] Update User:", userError.message);
      return {
        success: false,
        error: "Gagal memperbarui kredensial (Email mungkin sudah dipakai).",
      };
    }

    // Update data demografi pasien
    const { error: pasienError } = await supabase
      .from("pasien")
      .update({
        nama_lengkap: payload.nama_lengkap,
        usia: payload.usia,
        jenis_kelamin: payload.jenis_kelamin,
        domisili: payload.domisili,
        no_telp: payload.no_telp,
        pendidikan: payload.pendidikan,
        pekerjaan: payload.pekerjaan,
        pendapatan: payload.pendapatan,
      })
      .eq("id_pasien", payload.id_pasien);

    if (pasienError) {
      return handleServiceError(pasienError, "Gagal memperbarui data pasien.");
    }

    return { success: true, message: "Data pasien berhasil diperbarui!" };
  } catch (error) {
    return handleServiceError(error);
  }
};

export const deletePasien = async (
  supabase: SupabaseClient,
  id_pasien: number,
): Promise<ActionResponse> => {
  try {
    const { data: pasien } = await supabase
      .from("pasien")
      .select("id_user")
      .eq("id_pasien", id_pasien)
      .single();

    if (!pasien) {
      return { success: false, error: "Pasien tidak ditemukan." };
    }

    const { error: deletePasienError } = await supabase
      .from("pasien")
      .delete()
      .eq("id_pasien", id_pasien);

    if (deletePasienError) {
      console.error("[DB ERROR] Delete Pasien:", deletePasienError.message);
      return { success: false, error: "Gagal menghapus data pasien." };
    }

    // Hapus akun login terkait (data medis ikut terhapus via ON DELETE CASCADE)
    const { error: deleteUserError } = await supabase
      .from("users")
      .delete()
      .eq("id_user", pasien.id_user);

    if (deleteUserError) {
      return handleServiceError(
        deleteUserError,
        "Data pasien terhapus, namun gagal menghapus akun login.",
      );
    }

    return {
      success: true,
      message: "Pasien dan akunnya berhasil dihapus permanen.",
    };
  } catch (error) {
    return handleServiceError(error);
  }
};
