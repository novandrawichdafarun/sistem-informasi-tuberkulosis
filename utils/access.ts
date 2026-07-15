import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function verifyNakesAccess(id_user_nakes: string) {
  const { data, error } = await supabase
    .from("nakes")
    .select("id_nakes, id_faskes")
    .eq("id_user", id_user_nakes)
    .single();
  return { nakes: data, error };
}
