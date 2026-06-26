import { createServerSupabase } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

/**
 * Vérifie l'authentification et récupère le profil + agency_id de
 * l'utilisateur connecté. Redirige automatiquement si non connecté
 * ou si le profil n'est pas configuré — c'est le comportement voulu
 * sur toutes les sous-pages (biens, contacts, rendez-vous...), qui
 * n'ont pas besoin d'afficher un écran d'erreur dédié comme le fait
 * la page dashboard principale.
 */
export async function requireAgency() {
  const supabase = createServerSupabase();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/connexion");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, agency_id")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) redirect("/dashboard");

  return { supabase, user, profile, agencyId: profile.agency_id };
}

