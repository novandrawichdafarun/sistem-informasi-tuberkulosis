import { SupabaseClient } from "@supabase/supabase-js";

export async function verifyNakesAccess(
  supabase: SupabaseClient,
  id_user_nakes: string,
) {
  const { data, error } = await supabase
    .from("nakes")
    .select("id_nakes, id_faskes")
    .eq("id_user", id_user_nakes)
    .single();
  return { nakes: data, error };
}
