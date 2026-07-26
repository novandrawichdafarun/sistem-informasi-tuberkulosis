import { SupabaseClient } from "@supabase/supabase-js";

export async function verifySuperAdminAccess(
  supabase: SupabaseClient,
  id_super_admin: string,
) {
  const { data, error } = await supabase
    .from("users")
    .select("id_user, role")
    .eq("id_user", id_super_admin)
    .single();
  return { superAdmin: data, error };
}
