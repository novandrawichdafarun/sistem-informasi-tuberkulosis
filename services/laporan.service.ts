import { ActionResponse } from "@/types/action";
import {
  JadwalObatHariIni,
  LaporanObatPayload,
  StatusLaporanFinal,
} from "@/types/laporan";
import { verifyPasienAccess } from "@/utils/access";
import { isReportLate, todayISO } from "@/utils/date";
import { handleServiceError } from "@/utils/error";
import { getPasienIdByUser } from "@/utils/Pasien";
import { SupabaseClient } from "@supabase/supabase-js";

export async function getJadwalByPasienId(
  supabase: SupabaseClient,
  id_user_pasien: string,
): Promise<ActionResponse<JadwalObatHariIni[]>> {
  try {
    const { pasien, error } = await verifyPasienAccess(
      supabase,
      id_user_pasien,
    );

    if (error || !pasien)
      return { success: false, error: "Otoritas tidak valid." };

    const pasienId = await getPasienIdByUser(supabase, id_user_pasien);

    const { data, error: dataError } = await supabase
      .from("jadwal_minum_obat")
      .select(
        `
        id_jadwal, tanggal_jadwal, jam_jadwal,
        detail_obat!inner (
          jumlah_obat_per_minum, aturan_pakai,
          obat!inner (
            nama_obat
          ),
          resep_pengobatan!inner (
            episode_pengobatan!inner (
              id_pasien
            )
          )
        ),
        medication_log (
          id_log, status,
          catatan_kepatuhan
        )
        `,
      )
      .eq("tanggal_jadwal", todayISO())
      .eq("detail_obat.resep_pengobatan.episode_pengobatan.id_pasien", pasienId)
      .order("jam_jadwal", { ascending: true });

    if (dataError)
      return handleServiceError(dataError?.message, "Gagal mengambil Data");

    const formattedData: JadwalObatHariIni[] = (data ?? []).map((item) => {
      const detailObat = Array.isArray(item.detail_obat)
        ? (item.detail_obat[0] ?? null)
        : (item.detail_obat ?? null);

      const obat = Array.isArray(detailObat?.obat)
        ? (detailObat.obat[0] ?? null)
        : (detailObat?.obat ?? null);

      return {
        id_jadwal: item.id_jadwal,
        tanggal_jadwal: item.tanggal_jadwal,
        jam_jadwal: item.jam_jadwal,
        detail_obat: {
          jumlah_obat_per_minum: detailObat?.jumlah_obat_per_minum ?? 0,
          aturan_pakai: detailObat?.aturan_pakai ?? "",
          obat: {
            nama_obat: obat?.nama_obat ?? "",
          },
        },
        medication_log: Array.isArray(item.medication_log)
          ? item.medication_log[0] || null
          : item.medication_log || null,
      };
    });

    return {
      success: true,
      data: formattedData,
    };
  } catch (error) {
    return handleServiceError(error, "Gagal mengambil jadwal minum obat");
  }
}

export async function laporMinumObat(
  supabase: SupabaseClient,
  payload: LaporanObatPayload,
  id_user_pasien: string,
): Promise<ActionResponse> {
  try {
    const { pasien, error } = await verifyPasienAccess(
      supabase,
      id_user_pasien,
    );

    if (error || !pasien)
      return { success: false, error: "Otoritas tidak valid." };

    const { data: jadwal, error: fetchError } = await supabase
      .from("jadwal_minum_obat")
      .select("tanggal_jadwal, jam_jadwal")
      .eq("id_jadwal", payload.id_jadwal)
      .single();

    if (fetchError || !jadwal)
      return handleServiceError(
        fetchError?.message,
        "Jadwal minum obat tidak ditemukan",
      );

    let finalStatus: StatusLaporanFinal = "diminum";
    if (payload.status_input === "ditunda") {
      finalStatus = "ditunda";
    } else if (payload.status_input === "diminum") {
      const late = isReportLate(jadwal.tanggal_jadwal, jadwal.jam_jadwal, 1);
      if (late) {
        finalStatus = "terlewat";
      }
    }

    const { error: insertError } = await supabase
      .from("medication_log")
      .insert({
        id_jadwal: payload.id_jadwal,
        status: finalStatus,
        catatan_kepatuhan: payload.catatan_kepatuhan || null,
        reported_by: payload.reported_by,
      });

    if (insertError) {
      if (insertError.code === "23505") {
        return handleServiceError(
          insertError?.code,
          "Obat untuk jadwal ini sudah pernah dilaporkan.",
        );
      }
      return handleServiceError(
        insertError?.message,
        "Gagal menyimpan laporan",
      );
    }

    return { success: true, message: "Minum obat berhasil dilaporkan" };
  } catch (error) {
    return handleServiceError(error, "Gagal melaporkan minum obat");
  }
}
