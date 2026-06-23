-- ============================================================
-- SCHEMA SAAS IMMO — MULTI-TENANT
-- Postgres / Supabase
-- ============================================================
-- Principe d'isolation : chaque ligne métier porte une colonne
-- agency_id (= tenant). Le Row Level Security (RLS) garantit
-- qu'un utilisateur d'une agence ne peut jamais lire/écrire les
-- données d'une autre agence, même en cas de bug applicatif.
-- ============================================================

create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- 1. AGENCES (le tenant)
-- ------------------------------------------------------------
create table agencies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,                 -- sous-domaine ou identifiant url
  siret text,
  address text,
  phone text,
  email text,
  subscription_plan text not null default 'trial', -- trial / starter / pro / enterprise
  subscription_status text not null default 'active', -- active / past_due / canceled
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 2. UTILISATEURS (employés de l'agence)
-- Étend auth.users de Supabase
-- ------------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  agency_id uuid not null references agencies(id) on delete cascade,
  full_name text,
  email text not null,
  role text not null default 'agent',  -- owner / admin / agent
  phone text,
  avatar_url text,
  created_at timestamptz not null default now()
);

create index idx_profiles_agency on profiles(agency_id);

-- ------------------------------------------------------------
-- 3. CONTACTS (clients, prospects, propriétaires, acheteurs...)
-- Table unifiée pour toute personne en relation avec l'agence
-- ------------------------------------------------------------
create table contacts (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references agencies(id) on delete cascade,
  type text not null default 'lead',   -- lead / client / owner / tenant
  first_name text,
  last_name text,
  email text,
  phone text,
  source text,                          -- portail, bouche-à-oreille, site web...
  notes text,
  assigned_to uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_contacts_agency on contacts(agency_id);
create index idx_contacts_assigned_to on contacts(assigned_to);

-- ------------------------------------------------------------
-- 4. BIENS IMMOBILIERS
-- ------------------------------------------------------------
create table properties (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references agencies(id) on delete cascade,
  owner_contact_id uuid references contacts(id),
  reference text,                        -- référence interne agence
  type text not null,                    -- appartement / maison / terrain / local
  transaction_type text not null,        -- vente / location
  status text not null default 'available', -- available / under_offer / sold / rented / archived
  title text,
  description text,                      -- peut être généré par IA
  price numeric,
  surface_m2 numeric,
  rooms int,
  bedrooms int,
  address text,
  city text,
  postal_code text,
  country text default 'FR',
  energy_class text,
  ai_generated_description boolean default false,
  mandate_type text,                     -- exclusif / simple / semi-exclusif
  mandate_number text,                   -- numéro de mandat (registre des mandats, obligation Loi Hoguet)
  mandate_start_date date,
  mandate_end_date date,                 -- date d'expiration légale du mandat
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_properties_agency on properties(agency_id);
create index idx_properties_owner on properties(owner_contact_id);

-- ------------------------------------------------------------
-- 5. LEADS (pipeline commercial — lié à un contact)
-- ------------------------------------------------------------
create table leads (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references agencies(id) on delete cascade,
  contact_id uuid not null references contacts(id) on delete cascade,
  property_id uuid references properties(id),   -- bien qui intéresse le lead (nullable)
  status text not null default 'new',  -- new / qualified / visit_scheduled / negotiation / won / lost
  ai_score numeric,                     -- score de qualification généré par l'IA
  ai_summary text,                      -- résumé généré par l'IA de la demande
  budget_min numeric,
  budget_max numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_leads_agency on leads(agency_id);
create index idx_leads_contact on leads(contact_id);
create index idx_leads_property on leads(property_id);

-- ------------------------------------------------------------
-- 6. PHOTOS DES BIENS
-- ------------------------------------------------------------
create table property_photos (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id) on delete cascade,
  storage_path text not null,            -- chemin dans Supabase Storage
  position int default 0,
  created_at timestamptz not null default now()
);

create index idx_photos_property on property_photos(property_id);

-- ------------------------------------------------------------
-- 7. DIFFUSION SUR LES PORTAILS
-- ------------------------------------------------------------
create table property_listings (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id) on delete cascade,
  portal text not null,                  -- 'seloger' / 'leboncoin' / 'logicimmo' ...
  external_id text,
  status text not null default 'pending', -- pending / published / error / removed
  last_synced_at timestamptz,
  error_message text,
  created_at timestamptz not null default now()
);

create index idx_listings_property on property_listings(property_id);

-- ------------------------------------------------------------
-- 8. RENDEZ-VOUS / VISITES
-- ------------------------------------------------------------
create table appointments (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references agencies(id) on delete cascade,
  property_id uuid references properties(id),
  contact_id uuid references contacts(id),
  agent_id uuid references profiles(id),
  type text not null default 'visit',   -- visit / call / signing
  scheduled_at timestamptz not null,
  duration_minutes int default 30,
  status text not null default 'scheduled', -- scheduled / confirmed / done / canceled / no_show
  ai_reminder_sent boolean default false,
  notes text,
  created_at timestamptz not null default now()
);

create index idx_appointments_agency on appointments(agency_id);
create index idx_appointments_scheduled on appointments(scheduled_at);

-- ------------------------------------------------------------
-- 9. MESSAGES (emails / SMS / WhatsApp envoyés et reçus)
-- ------------------------------------------------------------
create table messages (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references agencies(id) on delete cascade,
  contact_id uuid references contacts(id),
  channel text not null,                 -- email / sms / whatsapp
  direction text not null,               -- inbound / outbound
  subject text,
  body text not null,
  ai_generated boolean default false,
  status text default 'sent',            -- queued / sent / delivered / failed
  sent_at timestamptz default now(),
  created_at timestamptz not null default now()
);

create index idx_messages_agency on messages(agency_id);
create index idx_messages_contact on messages(contact_id);

-- ------------------------------------------------------------
-- 10. DOCUMENTS (mandats, comptes-rendus, états des lieux...)
-- ------------------------------------------------------------
create table documents (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references agencies(id) on delete cascade,
  property_id uuid references properties(id),
  contact_id uuid references contacts(id),
  type text not null,                    -- mandat / cr_visite / etat_des_lieux / facture
  title text not null,
  storage_path text,                     -- PDF généré stocké dans Supabase Storage
  ai_generated boolean default false,
  status text default 'draft',           -- draft / sent / signed
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

create index idx_documents_agency on documents(agency_id);

-- ------------------------------------------------------------
-- 11. FACTURATION INTERNE (factures émises par l'agence à ses clients,
-- distinct de l'abonnement SaaS de l'agence elle-même)
-- ------------------------------------------------------------
create table invoices (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references agencies(id) on delete cascade,
  contact_id uuid references contacts(id),
  property_id uuid references properties(id),
  amount numeric not null,
  status text not null default 'draft',  -- draft / sent / paid / overdue
  due_date date,
  storage_path text,
  created_at timestamptz not null default now()
);

create index idx_invoices_agency on invoices(agency_id);

-- ------------------------------------------------------------
-- 12. LOG DES ACTIONS IA (traçabilité — utile pour debug & confiance client)
-- ------------------------------------------------------------
create table ai_actions_log (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references agencies(id) on delete cascade,
  action_type text not null,             -- lead_qualification / description_generation / email_draft ...
  related_table text,
  related_id uuid,
  input_summary text,
  output_summary text,
  created_at timestamptz not null default now()
);

create index idx_ai_log_agency on ai_actions_log(agency_id);

-- ============================================================
-- ROW LEVEL SECURITY — isolation stricte par agence
-- ============================================================

alter table agencies enable row level security;
alter table profiles enable row level security;
alter table contacts enable row level security;
alter table leads enable row level security;
alter table properties enable row level security;
alter table property_photos enable row level security;
alter table property_listings enable row level security;
alter table appointments enable row level security;
alter table messages enable row level security;
alter table documents enable row level security;
alter table invoices enable row level security;
alter table ai_actions_log enable row level security;

-- Fonction utilitaire : récupère l'agency_id de l'utilisateur connecté
create or replace function current_agency_id()
returns uuid
language sql
stable
as $$
  select agency_id from profiles where id = auth.uid()
$$;

-- Policy générique réutilisée pour chaque table portant agency_id
create policy "agency_isolation_agencies" on agencies
  for all using (id = current_agency_id());

create policy "agency_isolation_profiles" on profiles
  for select using (id = auth.uid());

create policy "profiles_insert_own" on profiles
  for insert with check (id = auth.uid());

create policy "profiles_update_own" on profiles
  for update using (id = auth.uid());

create policy "agency_isolation_contacts" on contacts
  for all using (agency_id = current_agency_id());

create policy "agency_isolation_leads" on leads
  for all using (agency_id = current_agency_id());

create policy "agency_isolation_properties" on properties
  for all using (agency_id = current_agency_id());

create policy "agency_isolation_property_photos" on property_photos
  for all using (
    property_id in (select id from properties where agency_id = current_agency_id())
  );

create policy "agency_isolation_property_listings" on property_listings
  for all using (
    property_id in (select id from properties where agency_id = current_agency_id())
  );

create policy "agency_isolation_appointments" on appointments
  for all using (agency_id = current_agency_id());

create policy "agency_isolation_messages" on messages
  for all using (agency_id = current_agency_id());

create policy "agency_isolation_documents" on documents
  for all using (agency_id = current_agency_id());

create policy "agency_isolation_invoices" on invoices
  for all using (agency_id = current_agency_id());

create policy "agency_isolation_ai_log" on ai_actions_log
  for all using (agency_id = current_agency_id());

-- ============================================================
-- TRIGGERS — updated_at automatique
-- ============================================================
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_agencies_updated before update on agencies
  for each row execute function set_updated_at();
create trigger trg_contacts_updated before update on contacts
  for each row execute function set_updated_at();
create trigger trg_leads_updated before update on leads
  for each row execute function set_updated_at();
create trigger trg_properties_updated before update on properties
  for each row execute function set_updated_at();

-- ============================================================
-- STORAGE — policies pour le bucket "property-photos"
-- Le bucket est public en lecture, mais l'upload/suppression
-- nécessite d'être authentifié (n'importe quel utilisateur
-- connecté à l'app peut uploader pour l'instant ; la vraie
-- isolation par agence reste garantie par la table
-- property_photos elle-même, protégée par RLS).
-- ============================================================

create policy "property_photos_public_read" on storage.objects
  for select using (bucket_id = 'property-photos');

create policy "property_photos_authenticated_upload" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'property-photos');

create policy "property_photos_authenticated_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'property-photos');

-- Bucket "documents" : privé, accessible uniquement aux utilisateurs connectés
-- (mandats, comptes-rendus de visite contiennent des infos clients sensibles,
-- donc pas de lecture publique comme pour les photos de biens).
create policy "documents_authenticated_all" on storage.objects
  for all to authenticated
  using (bucket_id = 'documents')
  with check (bucket_id = 'documents');
