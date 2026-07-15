"use server";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  createPemeriksaanKlinis,
  deletePemeriksaanKlinis,
  getDaftarPemeriksaanByNakes,
  updatePemeriksaanKlinis,
} from "@/services/pemeriksaanKlinis.service";
import {
  CreatePemeriksaanPayload,
  UpdatePemeriksaanPayload,
} from "@/types/pemeriksaanKlinis";
import { parseOptionalNumber } from "@/utils/number";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

export async function getDaftarPemeriksaanAction() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "nakes") {
    return {
      success: false,
      message: "Akses ditolak: Hanya Nakes yang diizinkan.",
    };
  }

  return await getDaftarPemeriksaanByNakes(session.user.id);
}

export async function createPemeriksaanAction(formData: FormData) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "nakes") {
    return { error: "Akses ditolak: Anda tidak memiliki wewenang." };
  }

  const payload: CreatePemeriksaanPayload = {
    id_episode: Number(formData.get("id_episode")),
    tanggal_periksa: formData.get("tanggal_periksa") as string,
    keluhan: (formData.get("keluhan") as string) || undefined,
    tensi: (formData.get("tensi") as string) || undefined,
    suhu: parseOptionalNumber(formData.get("suhu")),
    pernapasan: parseOptionalNumber(formData.get("pernapasan")),
    nadi: parseOptionalNumber(formData.get("nadi")),
    saturasi_o2: parseOptionalNumber(formData.get("saturasi_o2")),
    tinggi_badan_saat_ini: parseOptionalNumber(
      formData.get("tinggi_badan_saat_ini"),
    ),
    berat_badan_saat_ini: parseOptionalNumber(
      formData.get("berat_badan_saat_ini"),
    ),
  };

  if (!payload.id_episode || !payload.tanggal_periksa) {
    return {
      error: "Sistem mendeteksi data ID Episode atau Tanggal yang kosong!",
    };
  }

  const result = await createPemeriksaanKlinis(payload, session.user.id);

  if (result.success) {
    revalidatePath("/dashboard/pemeriksaan-klinis");
    return { success: true, message: result.message };
  } else {
    return { error: result.message };
  }
}

export async function updatePemeriksaanAction(formData: FormData) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "nakes") {
    return { error: "Akses ditolak." };
  }

  const payload: UpdatePemeriksaanPayload = {
    id_periksa: Number(formData.get("id_periksa")),
    id_episode: Number(formData.get("id_episode")), // Dibutuhkan untuk validasi keamanan di service
    tanggal_periksa: formData.get("tanggal_periksa") as string,
    keluhan: (formData.get("keluhan") as string) || undefined,
    tensi: (formData.get("tensi") as string) || undefined,
    suhu: parseOptionalNumber(formData.get("suhu")),
    pernapasan: parseOptionalNumber(formData.get("pernapasan")),
    nadi: parseOptionalNumber(formData.get("nadi")),
    saturasi_o2: parseOptionalNumber(formData.get("saturasi_o2")),
    tinggi_badan_saat_ini: parseOptionalNumber(
      formData.get("tinggi_badan_saat_ini"),
    ),
    berat_badan_saat_ini: parseOptionalNumber(
      formData.get("berat_badan_saat_ini"),
    ),
  };

  if (!payload.id_periksa || !payload.id_episode || !payload.tanggal_periksa) {
    return { error: "Data utama tidak lengkap." };
  }

  const result = await updatePemeriksaanKlinis(payload, session.user.id);

  if (result.success) {
    revalidatePath("/dashboard/pemeriksaan-klinis");
    return { success: true, message: result.message };
  } else {
    return { error: result.message };
  }
}

export async function deletePemeriksaanAction(id_periksa: number) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "nakes") {
    return { error: "Akses ditolak." };
  }

  const result = await deletePemeriksaanKlinis(id_periksa, session.user.id);

  if (result.success) {
    revalidatePath("/dashboard/pemeriksaan-klinis");
    return { success: true, message: result.message };
  } else {
    return { error: result.message };
  }
}
