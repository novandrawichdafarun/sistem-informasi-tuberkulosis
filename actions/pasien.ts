"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  createPasien,
  deletePasien,
  getPasienByNakesId,
  updatePasien,
} from "@/services/pasien.service";
import { CreatePasienPayload, UpdatePasienPayload } from "@/types/pasien";
import { revalidatePath } from "next/cache";

export async function getDaftarPasienAction() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "nakes") {
    return {
      success: false,
      message: "Akses ditolak: Hanya Nakes yang diizinkan.",
    };
  }

  return await getPasienByNakesId(session.user.id);
}

export async function createPasienAction(formData: FormData) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "nakes") {
    return {
      error: "Akses ditolak: Anda tidak memiliki wewenang mendaftarkan pasien.",
    };
  }

  const payload: CreatePasienPayload = {
    nama_lengkap: formData.get("nama_lengkap") as string,
    nik: formData.get("nik") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    no_rm: (formData.get("no_rm") as string) || "",
    tanggal_lahir: formData.get("tanggal_lahir") as string,
    jenis_kelamin: formData.get("jenis_kelamin") as "L" | "P",
    alamat: (formData.get("alamat") as string) || "",
    no_telp: (formData.get("no_telp") as string) || "",
    tinggi_badan_awal: formData.get("tinggi_badan_awal")
      ? Number(formData.get("tinggi_badan_awal"))
      : 0,
    berat_badan_awal: formData.get("berat_badan_awal")
      ? Number(formData.get("berat_badan_awal"))
      : 0,
  };

  if (
    !payload.nama_lengkap ||
    !payload.nik ||
    !payload.email ||
    !payload.password ||
    !payload.tanggal_lahir ||
    !payload.jenis_kelamin
  ) {
    return { error: "Kolom yang ditandai bintang (*) wajib diisi!" };
  }

  if (!payload.password || payload.password.length < 6) {
    return { error: "Kata sandi minimal 6 karakter!" };
  }

  const result = await createPasien(payload, session.user.id);

  if (result.success) {
    revalidatePath("/dashboard/pasien");
  } else {
    return { error: result.message };
  }

  return { success: true, message: result.message };
}

export async function updatePasienAction(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "nakes")
    return { error: "Akses ditolak." };

  const id_pasien = Number(formData.get("id_pasien"));
  const id_user = formData.get("id_user") as string;
  const passwordInput = formData.get("password") as string;

  const payload: UpdatePasienPayload = {
    id_pasien,
    id_user,
    nama_lengkap: formData.get("nama_lengkap") as string,
    nik: formData.get("nik") as string,
    email: formData.get("email") as string,
    password: passwordInput ? passwordInput : undefined, // Opsional
    no_rm: (formData.get("no_rm") as string) || "",
    tanggal_lahir: formData.get("tanggal_lahir") as string,
    jenis_kelamin: formData.get("jenis_kelamin") as "L" | "P",
    alamat: (formData.get("alamat") as string) || "",
    no_telp: (formData.get("no_telp") as string) || "",
    tinggi_badan_awal: formData.get("tinggi_badan_awal")
      ? Number(formData.get("tinggi_badan_awal"))
      : 0,
    berat_badan_awal: formData.get("berat_badan_awal")
      ? Number(formData.get("berat_badan_awal"))
      : 0,
  };

  // Validasi sandi JIKA DIISI
  if (payload.password && payload.password.length < 6) {
    return { error: "Jika ingin mengganti kata sandi, minimal 6 karakter!" };
  }

  const result = await updatePasien(payload, session.user.id);

  if (result.success) revalidatePath("/dashboard/pasien");
  else return { error: result.message };

  return { success: true };
}

export async function deletePasienAction(id_pasien: number) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "nakes")
    return { error: "Akses ditolak." };

  const result = await deletePasien(id_pasien, session.user.id);

  if (result.success) revalidatePath("/dashboard/pasien");
  else return { error: result.message };

  return { success: true };
}
