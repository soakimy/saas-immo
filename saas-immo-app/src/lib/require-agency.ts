import { createServerSupabase } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

export async function requireAgency() {
  const supabase = createServerSupabase();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/connexion");

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("full_name, agency_id")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile) {
    return { supabase, user, profile: null, agencyName: null as string | null };
  }

  const { data: agency } = await supabase
    .from("agencies")
    .select("name")
    .eq("id", profile.agency_id)
    .maybeSingle();

  return {
    supabase,
    user,
    profile,
    agencyName: agency?.name ?? "votre agence",
  };
}
