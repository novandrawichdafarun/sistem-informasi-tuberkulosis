import { SupabaseClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import {
  CreatePasienPayload,
  PasienData,
  UpdatePasienPayload,
} from "@/types/pasien";
import { ActionResponse } from "@/types/action";
import { verifySuperAdminAccess } from "@/utils/access";
import { handleServiceError } from "@/utils/error";

export const getDaftarPasien = async (
  supabase: SupabaseClient,
  id_super_admin: string,
): Promise<ActionResponse<PasienData[]>> => {
  try {
    const { superAdmin, error } = await verifySuperAdminAccess(
      supabase,
      id_super_admin,
    );
    if (error || !superAdmin)
      return { success: false, error: "Otoritas tidak valid." };

    const { data: pasien, error: pasienError } = await supabase
      .from("pasien")
      .select(
        `
        id_pasien, id_user, nama_lengkap, usia, jenis_kelamin,
        domisili, no_telp, pendidikan, pekerjaan, pendapatan, created_at,
        users ( email )
      `,
      )
      .order("created_at", { ascending: false });

    if (pasienError) {
      return handleServiceError(
        pasienError,
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
  id_super_admin: string,
): Promise<ActionResponse> => {
  try {
    const { superAdmin, error } = await verifySuperAdminAccess(
      supabase,
      id_super_admin,
    );
    if (error || !superAdmin)
      return { success: false, error: "Otoritas tidak valid." };

    // Cek duplikasi Email
    const { data: existingUser } = await supabase
      .from("users")
      .select("id_user")
      .eq("email", payload.email)
      .single();

    if (existingUser) {
      return { success: false, error: "Email sudah terdaftar di sistem!" };
    }

    // Hash Password & Insert User
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

    // Insert Data Medis Pasien
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

    // Rollback Manual jika insert pasien gagal
    if (pasienError) {
      await supabase.from("users").delete().eq("id_user", newUser.id_user);
      return handleServiceError(
        pasienError,
        "Gagal menyimpan data medis pasien. Pendaftaran dibatalkan",
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
  id_super_admin: string,
): Promise<ActionResponse> => {
  try {
    const { superAdmin, error } = await verifySuperAdminAccess(
      supabase,
      id_super_admin,
    );
    if (error || !superAdmin)
      return { success: false, error: "Otoritas tidak valid." };

    // Update Data User (Kredensial)
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

    // Update Data Medis Pasien
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
      return handleServiceError(
        pasienError,
        "Gagal memperbarui profil medis pasien.",
      );
    }

    return { success: true, message: "Data pasien berhasil diperbarui!" };
  } catch (error) {
    return handleServiceError(error);
  }
};

export const deletePasien = async (
  supabase: SupabaseClient,
  id_pasien: number,
  id_super_admin: string,
): Promise<ActionResponse> => {
  try {
    const { superAdmin, error } = await verifySuperAdminAccess(
      supabase,
      id_super_admin,
    );
    if (error || !superAdmin)
      return { success: false, error: "Otoritas tidak valid." };

    const { data: pasien } = await supabase
      .from("pasien")
      .select("id_user")
      .eq("id_pasien", id_pasien)
      .single();

    if (!pasien) {
      return {
        success: false,
        error: "Pasien tidak ditemukan atau bukan milik Anda.",
      };
    }

    const { error: deletePasienError } = await supabase
      .from("pasien")
      .delete()
      .eq("id_pasien", id_pasien);

    if (deletePasienError) {
      console.error("[DB ERROR] Delete Pasien:", deletePasienError.message);
      return { success: false, error: "Gagal menghapus data medis pasien." };
    }

    const { error: deleteUserError } = await supabase
      .from("users")
      .delete()
      .eq("id_user", pasien.id_user);

    if (deleteUserError) {
      return handleServiceError(
        deletePasienError,
        "Gagal menghapus akun pasien. Operasi dibatalkan otomatis.",
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
