import { SupabaseClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import {
  CreatePasienPayload,
  PasienData,
  UpdatePasienPayload,
} from "@/types/pasien";
import { ActionResponse } from "@/types/action";
import { verifyNakesAccess } from "@/utils/access";

export const getPasienByNakesId = async (
  supabase: SupabaseClient,
  id_user_nakes: string,
): Promise<ActionResponse<PasienData[]>> => {
  try {
    const { nakes, error } = await verifyNakesAccess(supabase, id_user_nakes);
    if (error || !nakes)
      return { success: false, error: "Otoritas Nakes tidak valid." };

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
      console.error("[DB ERROR] getPasienByNakesId:", pasienError.message);
      return {
        success: false,
        error: "Gagal mengambil data pasien dari sistem.",
      };
    }

    return { success: true, data: pasien as unknown as PasienData[] };
  } catch (error) {
    console.error("[SYSTEM ERROR] getPasienByNakesId:", error);
    return { success: false, error: "Terjadi kesalahan pada server." };
  }
};

export const createPasien = async (
  supabase: SupabaseClient,
  payload: CreatePasienPayload,
  id_user_nakes: string,
): Promise<ActionResponse> => {
  try {
    const { nakes, error } = await verifyNakesAccess(supabase, id_user_nakes);
    if (error || !nakes)
      return { success: false, error: "Otoritas Nakes tidak valid." };

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

    // Rollback Manual jika insert pasien gagal
    if (pasienError) {
      console.error("[DB ERROR] Insert Pasien:", pasienError.message);
      await supabase.from("users").delete().eq("id_user", newUser.id_user);
      return {
        success: false,
        error: "Gagal menyimpan data medis pasien. Pendaftaran dibatalkan.",
      };
    }

    return { success: true, message: "Pasien berhasil didaftarkan!" };
  } catch (error) {
    console.error("[SYSTEM ERROR] createPasien:", error);
    return {
      success: false,
      error: "Terjadi kesalahan internal server saat pendaftaran.",
    };
  }
};

export const updatePasien = async (
  supabase: SupabaseClient,
  payload: UpdatePasienPayload,
  id_user_nakes: string,
): Promise<ActionResponse> => {
  try {
    const { nakes, error } = await verifyNakesAccess(supabase, id_user_nakes);
    if (error || !nakes)
      return { success: false, error: "Otoritas Nakes tidak valid." };

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
      .eq("id_nakes", nakes.id_nakes); // Proteksi memastikan nakes hanya update pasien miliknya

    if (pasienError) {
      console.error("[DB ERROR] Update Pasien:", pasienError.message);
      return {
        success: false,
        error: "Gagal memperbarui profil medis pasien.",
      };
    }

    return { success: true, message: "Data pasien berhasil diperbarui!" };
  } catch (error) {
    console.error("[SYSTEM ERROR] updatePasien:", error);
    return {
      success: false,
      error: "Terjadi kesalahan internal saat memperbarui data.",
    };
  }
};

export const deletePasien = async (
  supabase: SupabaseClient,
  id_pasien: number,
  id_user_nakes: string,
): Promise<ActionResponse> => {
  try {
    const { nakes, error } = await verifyNakesAccess(supabase, id_user_nakes);
    if (error || !nakes)
      return { success: false, error: "Otoritas Nakes tidak valid." };

    const { data: pasien } = await supabase
      .from("pasien")
      .select("id_user")
      .eq("id_pasien", id_pasien)
      .eq("id_nakes", nakes.id_nakes) // Proteksi kepemilikan data
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

    // Jika gagal hapus user, kembalikan data pasien (Manual Rollback)
    if (deleteUserError) {
      console.error(
        "[DB CRITICAL] Gagal menghapus akun user (Orphan Data):",
        deleteUserError.message,
      );
      return {
        success: false,
        error: "Gagal menghapus akun pasien. Operasi dibatalkan otomatis.",
      };
    }

    return {
      success: true,
      message: "Pasien dan akunnya berhasil dihapus permanen.",
    };
  } catch (error) {
    console.error("[SYSTEM ERROR] deletePasien:", error);
    return {
      success: false,
      error: "Terjadi kesalahan internal saat menghapus pasien.",
    };
  }
};
