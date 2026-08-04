"use server";

import { createUserSchema, updateUserSchema } from "@/schemas/user.schema";
import {
  createUser,
  deleteuser,
  getDaftarAdminUser,
  updateUser,
} from "@/services/user.service";
import { ActionResponse } from "@/types/action";
import { UserData } from "@/types/user";
import { handleActionError } from "@/utils/error";
import { requireSuperAdminSession } from "@/utils/session";
import { getSupabaseServer } from "@/utils/supabase/server";
import { validateFormData } from "@/utils/validation";
import { revalidatePath } from "next/cache";

export async function getDaftarAdminUserAction(): Promise<
  ActionResponse<UserData[]>
> {
  try {
    const superAdminId = await requireSuperAdminSession();
    const supabase = await getSupabaseServer();
    return await getDaftarAdminUser(supabase, superAdminId);
  } catch (error) {
    return handleActionError(error);
  }
}

export async function createuserAction(
  formData: FormData,
): Promise<ActionResponse> {
  try {
    const superAdminId = await requireSuperAdminSession();
    const supabase = await getSupabaseServer();

    const { data, error } = validateFormData(formData, createUserSchema);
    if (error || !data)
      return { success: false, error: error || "Validasi gagal." };

    const result = await createUser(supabase, data, superAdminId);

    if (result.success) revalidatePath("/dashboard/user");

    return result;
  } catch (error) {
    return handleActionError(error);
  }
}

export async function updateUserAction(
  formData: FormData,
): Promise<ActionResponse> {
  try {
    const superAdminId = await requireSuperAdminSession();
    const supabase = await getSupabaseServer();

    const { data, error } = validateFormData(formData, updateUserSchema);
    if (error || !data)
      return { success: false, error: error || "Validasi gagal." };

    const result = await updateUser(supabase, data, superAdminId);

    if (result.success) revalidatePath("/dashboard/user");

    return result;
  } catch (error) {
    return handleActionError(error);
  }
}

export async function deleteUserAction(id_user: string) {
  try {
    const superAdminId = await requireSuperAdminSession();
    const supabase = await getSupabaseServer();

    const result = await deleteuser(supabase, id_user, superAdminId);

    if (result.success) revalidatePath("/dashboard/user");
    return result;
  } catch (error) {
    return handleActionError(error);
  }
}
