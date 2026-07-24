import { ActionResponse } from "@/types/action";
import { createObatPayload, ObatData, UpdateObatPayload } from "@/types/obat";
import { verifySuperAdminAccess } from "@/utils/access";
import { handleServiceError } from "@/utils/error";
import { SupabaseClient } from "@supabase/supabase-js";

export const getDaftarObat = async (
  supabase: SupabaseClient,
  id_super_admin: string,
): Promise<ActionResponse<ObatData[]>> => {
  try {
    const { superAdmin, error } = await verifySuperAdminAccess(
      supabase,
      id_super_admin,
    );
    if (error || !superAdmin)
      return { success: false, error: "Otoritas tidak valid." };

    const { data: obat, error: obatError } = await supabase
      .from("obat")
      .select(
        `
          id_obat, nama_obat, jenis_obat, kategori_obat,
          deskripsi, dosis, is_active, created_at
        `,
      )
      .order("created_at", { ascending: false });

    if (obatError)
      return handleServiceError(
        obatError?.message,
        "Gagal mengambil data obat dari sistem",
      );

    return { success: true, data: obat as ObatData[] };
  } catch (error) {
    return handleServiceError(
      error,
      "Terjadi kesalahan internal saat mengambil data.",
    );
  }
};

export const createObat = async (
  supabase: SupabaseClient,
  payload: createObatPayload,
  id_super_admin: string,
): Promise<ActionResponse> => {
  try {
    const { superAdmin, error } = await verifySuperAdminAccess(
      supabase,
      id_super_admin,
    );
    if (error || !superAdmin)
      return { success: false, error: "Otoritas tidak valid." };

    const { data: existingObat } = await supabase
      .from("obat")
      .select("id_obat")
      .eq("nama_obat", payload.nama_obat)
      .single();

    if (existingObat)
      return handleServiceError(
        existingObat,
        "Obat sudah terdaftar di sistem!",
      );

    const { error: insertError } = await supabase.from("obat").insert(payload);

    if (insertError)
      return handleServiceError(insertError?.message, "Gagal menyimpan obat");

    return { success: true, message: "Obat berhasil ditambahkan!" };
  } catch (error) {
    return handleServiceError(
      error,
      "Terjadi kesalahan internal server saat menambah data.",
    );
  }
};

export const updateObat = async (
  supabase: SupabaseClient,
  payload: UpdateObatPayload,
  id_super_admin: string,
): Promise<ActionResponse> => {
  try {
    const { superAdmin, error } = await verifySuperAdminAccess(
      supabase,
      id_super_admin,
    );
    if (error || !superAdmin)
      return { success: false, error: "Otoritas tidak valid." };

    const { data: obat, error: checkError } = await supabase
      .from("obat")
      .select("id_obat")
      .eq("id_obat", payload.id_obat)
      .single();

    if (checkError || !obat)
      return handleServiceError(checkError?.message, "Data tidak ditemukan");

    const { id_obat, ...updateData } = payload;
    const { error: updateError } = await supabase
      .from("obat")
      .update(updateData)
      .eq("id_obat", id_obat);

    if (updateError)
      return handleServiceError(
        updateError?.message,
        "Gagal memeperbarui data.",
      );

    return {
      success: true,
      message: "Data Obat berhasil diperbarui!",
    };
  } catch (error) {
    return handleServiceError(
      error,
      "Terjadi kesalahan internal saat memperbarui data.",
    );
  }
};

export const toggleStatusObat = async (
  supabase: SupabaseClient,
  id_obat: number,
  status: boolean,
  id_super_admin: string,
): Promise<ActionResponse> => {
  try {
    const { superAdmin, error } = await verifySuperAdminAccess(
      supabase,
      id_super_admin,
    );
    if (error || !superAdmin)
      return { success: false, error: "Otoritas tidak valid." };

    const { data: obat, error: checkError } = await supabase
      .from("obat")
      .select("id_obat")
      .eq("id_obat", id_obat)
      .single();

    if (checkError || !obat)
      return handleServiceError(checkError?.message, "Data tidak ditemukan");

    const { error: updateError } = await supabase
      .from("obat")
      .update({ is_active: status })
      .eq("id_obat", id_obat)
      .single();

    if (updateError)
      return handleServiceError(updateError?.message, "Gagal mengubah status.");

    return {
      success: true,
      message: "Status Obat berhasil diubah!",
    };
  } catch (error) {
    return handleServiceError(
      error,
      "Terjadi kesalahan internal saat mengubah status.",
    );
  }
};

export const deleteObat = async (
  supabase: SupabaseClient,
  id_obat: number,
  id_super_admin: string,
): Promise<ActionResponse> => {
  try {
    const { superAdmin, error } = await verifySuperAdminAccess(
      supabase,
      id_super_admin,
    );
    if (error || !superAdmin)
      return { success: false, error: "Otoritas tidak valid." };

    const { data: obat, error: checkError } = await supabase
      .from("obat")
      .select("id_obat")
      .eq("id_obat", id_obat)
      .single();

    if (checkError || !obat)
      return handleServiceError(checkError?.message, "Data tidak ditemukan");

    const { error: deleteError } = await supabase
      .from("obat")
      .delete()
      .eq("id_obat", id_obat);

    if (deleteError)
      return handleServiceError(deleteError?.message, "Gagal menghapus data.");

    return {
      success: true,
      message: "Data Obat berhasil dihapus.",
    };
  } catch (error) {
    return handleServiceError(
      error,
      "Terjadi kesalahan internal saat menghapus data.",
    );
  }
};
