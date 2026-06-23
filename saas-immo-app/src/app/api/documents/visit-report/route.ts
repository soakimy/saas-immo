import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { renderToBuffer } from "@react-pdf/renderer";
import { VisitReportDocument } from "@/lib/pdf/VisitReportDocument";

export async function POST(request: NextRequest) {
  const supabase = createServerSupabase();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const { appointmentId, notes } = await request.json();
  if (!appointmentId) {
    return NextResponse.json({ error: "appointmentId manquant." }, { status: 400 });
  }

  const { data: appointment, error: apptError } = await supabase
    .from("appointments")
    .select(
      "id, scheduled_at, type, property_id, contact_id, contacts(first_name, last_name, email, phone), properties(title, type, transaction_type, address, city, postal_code, price)"
    )
    .eq("id", appointmentId)
    .maybeSingle();

  if (apptError || !appointment) {
    return NextResponse.json({ error: "Rendez-vous introuvable." }, { status: 404 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("agency_id, full_name, agencies(name)")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    return NextResponse.json({ error: "Profil introuvable." }, { status: 404 });
  }

  const contact = appointment.contacts as any;
  const property = appointment.properties as any;
  const agencyName = (profile as any).agencies?.name ?? "Agence";

  const pdfBuffer = await renderToBuffer(
    VisitReportDocument({
      agencyName,
      agentName: profile.full_name ?? "",
      date: appointment.scheduled_at,
      contactName: contact ? `${contact.first_name ?? ""} ${contact.last_name ?? ""}`.trim() : "Non précisé",
      contactEmail: contact?.email ?? "",
      contactPhone: contact?.phone ?? "",
      propertyTitle: property?.title || `${property?.type ?? ""} — ${property?.city ?? ""}`,
      propertyAddress: [property?.address, property?.postal_code, property?.city].filter(Boolean).join(", "),
      propertyPrice: property?.price ?? null,
      notes: notes || "Aucune remarque particulière.",
    })
  );

  // On enregistre le document dans Supabase Storage pour le retrouver plus tard
  const fileName = `${appointmentId}/${Date.now()}-compte-rendu.pdf`;
  await supabase.storage.from("documents").upload(fileName, pdfBuffer, {
    contentType: "application/pdf",
  });

  await supabase.from("documents").insert({
    agency_id: profile.agency_id,
    property_id: appointment.property_id,
    contact_id: appointment.contact_id,
    type: "cr_visite",
    title: `Compte-rendu de visite — ${appointment.scheduled_at.slice(0, 10)}`,
    storage_path: fileName,
    ai_generated: false,
    status: "draft",
    created_by: user.id,
  });

  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=compte-rendu-visite.pdf",
    },
  });
}
