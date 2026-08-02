import { SupabaseClient } from "@supabase/supabase-js";
import { ActionResponse } from "@/types/action";
import { handleServiceError } from "@/utils/error";
import { getPasienIdByUser } from "@/utils/Pasien";
import {
  CreateLaporanMakanPayload,
  LaporanMakanData,
  LaporanMakanPasienOverview,
} from "@/types/laporanMakan";

const KOLOM = `id_laporan, id_pasien, waktu_makan, karbo, protein, serat, catatan, reported_at`;

// Pasien: simpan laporan makan miliknya sendiri.
export const createLaporanMakan = async (
  supabase: SupabaseClient,
  id_user_pasien: string,
  payload: CreateLaporanMakanPayload,
): Promise<ActionResponse> => {
  try {
    const id_pasien = await getPasienIdByUser(supabase, id_user_pasien);
    if (!id_pasien)
      return { success: false, error: "Profil pasien tidak ditemukan." };

    const waktuMakan = new Date(payload.waktu_makan);
    if (Number.isNaN(waktuMakan.getTime()))
      return { success: false, error: "Waktu makan tidak valid." };

    const { error } = await supabase.from("laporan_makan").insert({
      id_pasien,
      waktu_makan: waktuMakan.toISOString(),
      karbo: payload.karbo,
      protein: payload.protein,
      serat: payload.serat,
      catatan: payload.catatan ?? null,
      reported_at: new Date().toISOString(),
    });

    if (error)
      return handleServiceError(error.message, "Gagal menyimpan laporan makan.");

    return { success: true, message: "Laporan makan berhasil disimpan!" };
  } catch (error) {
    return handleServiceError(error);
  }
};

// Pasien: daftar laporan makan miliknya sendiri.
export const getLaporanMakanByUser = async (
  supabase: SupabaseClient,
  id_user_pasien: string,
): Promise<ActionResponse<LaporanMakanData[]>> => {
  try {
    const id_pasien = await getPasienIdByUser(supabase, id_user_pasien);
    if (!id_pasien) return { success: true, data: [] };

    const { data, error } = await supabase
      .from("laporan_makan")
      .select(KOLOM)
      .eq("id_pasien", id_pasien)
      .order("waktu_makan", { ascending: false });

    if (error)
      return handleServiceError(error.message, "Gagal memuat laporan makan.");

    return { success: true, data: (data as LaporanMakanData[]) ?? [] };
  } catch (error) {
    return handleServiceError(error);
  }
};

// Super admin: laporan makan dikelompokkan per pasien (satu baris/pasien
// + seluruh laporannya untuk ditampilkan pada detail).
export const getLaporanMakanGrouped = async (
  supabase: SupabaseClient,
): Promise<ActionResponse<LaporanMakanPasienOverview[]>> => {
  try {
    const { data, error } = await supabase
      .from("laporan_makan")
      .select(`${KOLOM}, pasien ( nama_lengkap, jenis_kelamin )`)
      .order("waktu_makan", { ascending: false });

    if (error)
      return handleServiceError(error.message, "Gagal memuat laporan makan.");

    type PasienRel = { nama_lengkap: string; jenis_kelamin: "L" | "P" };
    const grup = new Map<number, LaporanMakanPasienOverview>();

    for (const row of data ?? []) {
      const { pasien, ...rest } = row as unknown as LaporanMakanData & {
        pasien: PasienRel | PasienRel[] | null;
      };
      const rel = Array.isArray(pasien) ? pasien[0] : pasien;

      let overview = grup.get(rest.id_pasien);
      if (!overview) {
        overview = {
          id_pasien: rest.id_pasien,
          nama_pasien: rel?.nama_lengkap ?? "-",
          jenis_kelamin: rel?.jenis_kelamin ?? null,
          total: 0,
          terakhir: null,
          laporan: [],
        };
        grup.set(rest.id_pasien, overview);
      }

      overview.laporan.push(rest);
      overview.total += 1;
      // Data sudah terurut waktu_makan desc → yang pertama = terbaru.
      if (!overview.terakhir) overview.terakhir = rest.waktu_makan;
    }

    return { success: true, data: [...grup.values()] };
  } catch (error) {
    return handleServiceError(error);
  }
};
