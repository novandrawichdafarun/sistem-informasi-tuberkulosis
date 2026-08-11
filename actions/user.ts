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
import { validateFormData } from "@/utils/validation";
import { revalidatePath } from "next/cache";

export async function getDaftarAdminUserAction(): Promise<
  ActionResponse<UserData[]>
> {
  try {
    const superAdminId = await requireSuperAdminSession();
    return await getDaftarAdminUser(superAdminId);
  } catch (error) {
    return handleActionError(error);
  }
}

export async function createuserAction(
  formData: FormData,
): Promise<ActionResponse> {
  try {
    const superAdminId = await requireSuperAdminSession();

    const { data, error } = validateFormData(formData, createUserSchema);
    if (error || !data)
      return { success: false, error: error || "Validasi gagal." };

    const result = await createUser(data, superAdminId);

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

    const { data, error } = validateFormData(formData, updateUserSchema);
    if (error || !data)
      return { success: false, error: error || "Validasi gagal." };

    const result = await updateUser(data, superAdminId);

    if (result.success) revalidatePath("/dashboard/user");

    return result;
  } catch (error) {
    return handleActionError(error);
  }
}

export async function deleteUserAction(id_user: string) {
  try {
    const superAdminId = await requireSuperAdminSession();

    const result = await deleteuser(id_user, superAdminId);

    if (result.success) revalidatePath("/dashboard/user");
    return result;
  } catch (error) {
    return handleActionError(error);
  }
}
