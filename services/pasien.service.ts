import { SupabaseClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import {
  CreatePasienPayload,
  EpisodeRingkas,
  PasienData,
  PasienDetail,
  PasienProfile,
  UpdatePasienPayload,
} from "@/types/pasien";
import { ActionResponse } from "@/types/action";
import { verifyPasienAccess, verifySuperAdminAccess } from "@/utils/access";
import { handleServiceError } from "@/utils/error";
import { PemeriksaanKlinisData } from "@/types/pemeriksaanKlinis";
import { PemeriksaanLabData } from "@/types/pemeriksaanLab";
import { hitungKepatuhan } from "./laporan.service";

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

    if (pasienError)
      return handleServiceError(
        pasienError?.message,
        "Gagal mengambil data pasien dari sistem.",
      );

    return { success: true, data: pasien as unknown as PasienData[] };
  } catch (error) {
    return handleServiceError(
      error,
      "Terjadi kesalahan internal saat mengambil data.",
    );
  }
};

export const getPasienDetail = async (
  supabase: SupabaseClient,
  id_pasien: number,
  id_super_admin: string,
): Promise<ActionResponse<PasienDetail>> => {
  try {
    const { superAdmin, error } = await verifySuperAdminAccess(
      supabase,
      id_super_admin,
    );
    if (error || !superAdmin)
      return { success: false, error: "Otoritas tidak valid." };

    // Profil + akun
    const { data: profil, error: profilError } = await supabase
      .from("pasien")
      .select(
        `id_pasien, id_user, nama_lengkap, usia, jenis_kelamin, domisili,
         no_telp, pendidikan, pekerjaan, pendapatan, created_at, users ( email )`,
      )
      .eq("id_pasien", id_pasien)
      .single();

    if (profilError || !profil) {
      return handleServiceError(
        profilError?.message,
        "Pasien tidak ditemukan.",
      );
    }

    // Episodes
    const { data: episodes } = await supabase
      .from("episode_pengobatan")
      .select(
        "id_episode, tanggal_mulai, tanggal_selesai, tipe_pasien, status_episode",
      )
      .eq("id_pasien", id_pasien)
      .order("tanggal_mulai", { ascending: false });

    const episodeIds = (episodes ?? []).map((e) => e.id_episode as number);

    // klinis & Lab
    let klinis: PemeriksaanKlinisData[] = [];
    let lab: PemeriksaanLabData[] = [];
    if (episodeIds.length > 0) {
      const [vRes, lRes] = await Promise.all([
        supabase
          .from("pemeriksaan_klinis")
          .select(
            `id_periksa, id_episode, tanggal_periksa, keluhan, tensi, suhu,
             pernapasan, nadi, saturasi_o2, tinggi_badan, berat_badan, created_at`,
          )
          .in("id_episode", episodeIds)
          .order("tanggal_periksa", { ascending: false }),
        supabase
          .from("pemeriksaan_lab")
          .select(
            `id_tes, id_episode, jenis_tes, tanggal_tes, hasil_tes,
             periode_pemeriksaan, berkas_pendukung_url, created_at`,
          )
          .in("id_episode", episodeIds)
          .order("tanggal_tes", { ascending: false }),
      ]);
      klinis = (vRes.data as PemeriksaanKlinisData[]) ?? [];
      lab = (lRes.data as PemeriksaanLabData[]) ?? [];
    }

    // Kepatuhan 30 hari
    const kepatuhan = await hitungKepatuhan(supabase, episodeIds);

    return {
      success: true,
      data: {
        profil: profil as unknown as PasienData,
        episodes: (episodes as EpisodeRingkas[]) ?? [],
        klinis,
        lab,
        kepatuhan,
      },
    };
  } catch (error) {
    return handleServiceError(error);
  }
};

export const getPasienProfileByUser = async (
  supabase: SupabaseClient,
  id_user_pasien: string,
): Promise<ActionResponse<PasienProfile>> => {
  try {
    const { pasien, error } = await verifyPasienAccess(
      supabase,
      id_user_pasien,
    );

    if (error || !pasien)
      return { success: false, error: "Otoritas tidak valid." };

    const { data, error: profileError } = await supabase
      .from("pasien")
      .select(
        `
          id_pasien, id_user, nama_lengkap, usia, jenis_kelamin, domisili,
          no_telp, pendidikan, pekerjaan, pendapatan,
          episode_pengobatan ( id_episode, tanggal_mulai, tipe_pasien, status_episode )
        `,
      )
      .eq("id_user", id_user_pasien)
      .single();

    if (profileError || !data) {
      return handleServiceError(error, "Profil pasien tidak ditemukan.");
    }

    const episodes =
      (data.episode_pengobatan as PasienProfile["episodeAktif"][]) ?? [];
    const episodeAktif =
      episodes
        .filter((e) => e && e.status_episode === "aktif")
        .sort((a, b) =>
          (b!.tanggal_mulai ?? "").localeCompare(a!.tanggal_mulai ?? ""),
        )[0] ?? null;

    const profile: PasienProfile = {
      id_pasien: data.id_pasien,
      id_user: data.id_user,
      nama_lengkap: data.nama_lengkap,
      usia: data.usia,
      jenis_kelamin: data.jenis_kelamin,
      domisili: data.domisili,
      no_telp: data.no_telp,
      pendidikan: data.pendidikan,
      pekerjaan: data.pekerjaan,
      pendapatan: data.pendapatan,
      episodeAktif,
    };

    return { success: true, data: profile };
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

    if (existingUser)
      return handleServiceError(
        existingUser,
        "Email sudah terdaftar di sistem!",
      );

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

    if (userError || !newUser)
      return handleServiceError(
        userError?.message,
        "Gagal membuat kredensial akun pasien.",
      );

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
        pasienError?.message,
        "Gagal menyimpan data medis pasien. Pendaftaran dibatalkan",
      );
    }

    return { success: true, message: "Pasien berhasil didaftarkan!" };
  } catch (error) {
    return handleServiceError(
      error,
      "Terjadi kesalahan internal saat menambah data.",
    );
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

    if (userError)
      return handleServiceError(
        userError?.message,
        "Gagal memperbarui kredensial (Email mungkin sudah dipakai).",
      );

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

    if (pasienError)
      return handleServiceError(
        pasienError?.message,
        "Gagal memperbarui profil medis pasien.",
      );

    return { success: true, message: "Data pasien berhasil diperbarui!" };
  } catch (error) {
    return handleServiceError(
      error,
      "Terjadi kesalahan internal saat memperbarui data.",
    );
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

    if (!pasien) return handleServiceError(pasien, "Pasien tidak ditmeukan");

    const { error: deletePasienError } = await supabase
      .from("pasien")
      .delete()
      .eq("id_pasien", id_pasien);

    if (deletePasienError)
      return handleServiceError(
        deletePasienError?.message,
        "Gagal menghapus data medis pasien.",
      );

    // Hapus akun login terkait (data medis ikut terhapus via ON DELETE CASCADE)
    const { error: deleteUserError } = await supabase
      .from("users")
      .delete()
      .eq("id_user", pasien.id_user);

    if (deleteUserError)
      return handleServiceError(
        deleteUserError,
        "Data pasien terhapus, namun gagal menghapus akun login.",
      );

    return {
      success: true,
      message: "Pasien dan akunnya berhasil dihapus permanen.",
    };
  } catch (error) {
    return handleServiceError(
      error,
      "Terjadi kesalahan internal saat menghapus data.",
    );
  }
};
