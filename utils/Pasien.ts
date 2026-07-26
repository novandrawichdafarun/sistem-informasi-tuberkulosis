import { SupabaseClient } from "@supabase/supabase-js";

export async function getPasienIdByUser(
  supabase: SupabaseClient,
  id_user: string,
): Promise<number | null> {
  const { data } = await supabase
    .from("pasien")
    .select("id_pasien")
    .eq("id_user", id_user)
    .single();
  return data?.id_pasien ?? null;
}

export async function getResepIdsByPasien(
  supabase: SupabaseClient,
  id_pasien: number,
): Promise<number[]> {
  const { data: episodes } = await supabase
    .from("episode_pengobatan")
    .select("id_episode")
    .eq("id_pasien", id_pasien);

  const episodeIds = (episodes ?? []).map((e) => e.id_episode as number);
  if (episodeIds.length === 0) return [];

  const { data: resep } = await supabase
    .from("resep_pengobatan")
    .select("id_resep")
    .in("id_episode", episodeIds);

  return (resep ?? []).map((r) => r.id_resep as number);
}

export function parseTensi(t?: string | null): {
  sis: number | null;
  dia: number | null;
} {
  if (!t) return { sis: null, dia: null };
  const m = t.match(/(\d{2,3})\s*\/\s*(\d{2,3})/);
  if (!m) return { sis: null, dia: null };
  return { sis: Number(m[1]), dia: Number(m[2]) };
}
