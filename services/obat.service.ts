import { SupabaseClient } from "@supabase/supabase-js";
import { ActionResponse } from "@/types/action";
import { handleServiceError } from "@/utils/error";
import { CreateObatPayload, ObatData, UpdateObatPayload } from "@/types/obat";

const OBAT_COLUMNS =
  "id_obat, nama_obat, jenis_obat, kategori_obat, deskripsi, dosis, is_active, created_at";

export const getAllObat = async (
  supabase: SupabaseClient,
  onlyActive = false,
): Promise<ActionResponse<ObatData[]>> => {
  try {
    let query = supabase
      .from("obat")
      .select(OBAT_COLUMNS)
      .order("nama_obat", { ascending: true });

    if (onlyActive) query = query.eq("is_active", true);

    const { data, error } = await query;
    if (error) return handleServiceError(error, "Gagal memuat data obat.");

    return { success: true, data: (data as ObatData[]) ?? [] };
  } catch (error) {
    return handleServiceError(error);
  }
};

export const createObat = async (
  supabase: SupabaseClient,
  payload: CreateObatPayload,
): Promise<ActionResponse> => {
  try {
    const { error } = await supabase.from("obat").insert({ ...payload });
    if (error) return handleServiceError(error, "Gagal menyimpan obat.");
    return { success: true, message: "Obat berhasil ditambahkan!" };
  } catch (error) {
    return handleServiceError(error);
  }
};

export const updateObat = async (
  supabase: SupabaseClient,
  payload: UpdateObatPayload,
): Promise<ActionResponse> => {
  try {
    const { id_obat, ...updateData } = payload;
    const { error } = await supabase
      .from("obat")
      .update(updateData)
      .eq("id_obat", id_obat);
    if (error) return handleServiceError(error, "Gagal memperbarui obat.");
    return { success: true, message: "Obat berhasil diperbarui!" };
  } catch (error) {
    return handleServiceError(error);
  }
};

export const deleteObat = async (
  supabase: SupabaseClient,
  id_obat: number,
): Promise<ActionResponse> => {
  try {
    // Cegah hapus bila obat sedang dipakai di detail resep.
    const { data: dipakai } = await supabase
      .from("detail_obat")
      .select("id_detail_obat")
      .eq("id_obat", id_obat)
      .limit(1);

    if (dipakai && dipakai.length > 0) {
      return {
        success: false,
        error:
          "Obat sedang dipakai pada resep. Nonaktifkan saja (is_active) alih-alih menghapus.",
      };
    }

    const { error } = await supabase.from("obat").delete().eq("id_obat", id_obat);
    if (error) return handleServiceError(error, "Gagal menghapus obat.");
    return { success: true, message: "Obat berhasil dihapus." };
  } catch (error) {
    return handleServiceError(error);
  }
};
