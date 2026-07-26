import { SupabaseClient } from "@supabase/supabase-js";

export async function verifySuperAdminAccess(
  supabase: SupabaseClient,
  id_super_admin: string,
) {
  const { data, error } = await supabase
    .from("users")
    .select("id_user, role")
    .eq("id_user", id_super_admin)
    .eq("role", "super_admin")
    .single();
  return { superAdmin: data, error };
}

export async function verifyPasienAccess(
  supabase: SupabaseClient,
  id_user_pasien: string,
) {
  const { data, error } = await supabase
    .from("users")
    .select("id_user, role")
    .eq("id_user", id_user_pasien)
    .eq("role", "pasien")
    .single();
  return { pasien: data, error };
}
