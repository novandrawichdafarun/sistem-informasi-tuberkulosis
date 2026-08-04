import { ActionResponse } from "@/types/action";
import { CreateUserPayload, UpdateUserPayload, UserData } from "@/types/user";
import { verifySuperAdminAccess } from "@/utils/access";
import { handleServiceError } from "@/utils/error";
import { SupabaseClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

export const getDaftarAdminUser = async (
  supabase: SupabaseClient,
  id_super_admin: string,
): Promise<ActionResponse<UserData[]>> => {
  try {
    const { superAdmin, error } = await verifySuperAdminAccess(
      supabase,
      id_super_admin,
    );
    if (error || !superAdmin)
      return { success: false, error: "Otoritas tidak valid." };

    const { data, error: dataError } = await supabase
      .from("users")
      .select("id_user, email, role, created_at")
      .eq("role", "super_admin")
      .neq("id_user", id_super_admin)
      .order("created_at", { ascending: false });

    if (dataError)
      handleServiceError(dataError?.message, "Gagal mengambil data pengguna");

    return { success: true, data: data as unknown as UserData[] };
  } catch (error) {
    return handleServiceError(
      error,
      "Terjadi kesalahan internal saat mengambil data.",
    );
  }
};

export const createUser = async (
  supabase: SupabaseClient,
  payload: CreateUserPayload,
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

    if (existingUser)
      return handleServiceError(
        existingUser,
        "Email sudah terdaftar di sistem!",
      );

    // Buat akun login admin
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(payload.password, salt);

    const { error: insertError } = await supabase
      .from("users")
      .insert({
        email: payload.email,
        password_hash: hashedPassword,
        role: "super_admin",
      })
      .single();

    if (insertError)
      return handleServiceError(
        insertError?.message,
        "Gagal menyimpan data User",
      );

    return { success: true, message: "Data User berhasil ditambahkan!" };
  } catch (error) {
    return handleServiceError(
      error,
      "Terjadi kesalahan internal saat menambah data.",
    );
  }
};

export const updateUser = async (
  supabase: SupabaseClient,
  payload: UpdateUserPayload,
  id_super_admin: string,
): Promise<ActionResponse> => {
  try {
    const { superAdmin, error } = await verifySuperAdminAccess(
      supabase,
      id_super_admin,
    );
    if (error || !superAdmin)
      return { success: false, error: "Otoritas tidak valid." };

    const { data: user } = await supabase
      .from("users")
      .select("id_user")
      .eq("id_user", payload.id_user)
      .single();

    if (!user) return handleServiceError(user, "User tidak ditemukan");

    const updateUserData: { email: string; password_hash?: string } = {
      email: payload.email,
    };

    if (payload.password) {
      const salt = await bcrypt.genSalt(10);
      updateUserData.password_hash = await bcrypt.hash(payload.password, salt);
    }

    const { error: updateError } = await supabase
      .from("users")
      .update(updateUserData)
      .eq("id_user", payload.id_user);

    if (updateError)
      return handleServiceError(
        updateError?.message,
        "Gagal memperbarui kredensial (Email mungkin sudah dipakai).",
      );

    return { success: true, message: "Data User berhasil diperbarui!" };
  } catch (error) {
    return handleServiceError(
      error,
      "Terjadi kesalahan internal saat memperbarui data.",
    );
  }
};

export const deleteuser = async (
  supabase: SupabaseClient,
  id_user: string,
  id_super_admin: string,
): Promise<ActionResponse> => {
  try {
    const { superAdmin, error } = await verifySuperAdminAccess(
      supabase,
      id_super_admin,
    );
    if (error || !superAdmin)
      return { success: false, error: "Otoritas tidak valid." };

    const { data: user } = await supabase
      .from("users")
      .select("id_user")
      .eq("id_user", id_user)
      .single();

    if (!user) return handleServiceError(user, "User tidak ditmeukan");

    const { error: deleteError } = await supabase
      .from("users")
      .delete()
      .eq("id_user", id_user);

    if (deleteError)
      return handleServiceError(
        deleteError?.message,
        "Gagal menghapus data User.",
      );

    return {
      success: true,
      message: "Data User berhasil dihapus permanen.",
    };
  } catch (error) {
    return handleServiceError(
      error,
      "Terjadi kesalahan internal saat menghapus data.",
    );
  }
};
