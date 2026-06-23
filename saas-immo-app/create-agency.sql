-- ============================================================
-- Crée l'agence "MafEstate" et relie ton compte (créé dans
-- Authentication) à cette agence en tant que "owner".
-- ============================================================

-- 1. Créer l'agence
insert into agencies (name, slug)
values ('MafEstate', 'mafestate')
returning id;

-- 2. Lier ton profil à cette agence
-- Remplace 'ID_AGENCE_ICI' par l'id retourné juste au-dessus (étape 1)
insert into profiles (id, agency_id, full_name, email, role)
select
  (select id from auth.users where email = 'soakimy.mfa@icloud.com'),
  (select id from agencies where slug = 'mafestate'),
  'Soakimy',
  'soakimy.mfa@icloud.com',
  'owner';
