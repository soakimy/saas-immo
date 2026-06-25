-- ============================================================
-- DONNÉES DE DÉMONSTRATION
-- À exécuter une fois connecté avec l'agence existante.
-- Remplace 'mafestate' par le slug réel de ton agence si différent.
-- ============================================================

do $$
declare
  v_agency_id uuid;
  v_property_ids uuid[] := array[]::uuid[];
  v_contact_ids uuid[] := array[]::uuid[];
  v_new_id uuid;
begin
  select id into v_agency_id from agencies where slug = 'mafestate';
  if v_agency_id is null then
    raise exception 'Agence introuvable, vérifie le slug.';
  end if;

  insert into properties (agency_id, type, transaction_type, status, title, price, surface_m2, rooms, bedrooms, city, postal_code, country, created_at)
  values (v_agency_id, 'terrain', 'vente', 'available', 'Terrain à Villeurbanne', 59700.0, 325, null, null, 'Villeurbanne', '69002', 'FR', '2026-06-15T05:23:16.908487')
  returning id into v_new_id;
  v_property_ids := array_append(v_property_ids, v_new_id);

  insert into properties (agency_id, type, transaction_type, status, title, price, surface_m2, rooms, bedrooms, city, postal_code, country, created_at)
  values (v_agency_id, 'maison', 'location', 'available', 'Maison à Lyon', 385, 32, 1, null, 'Lyon', '69001', 'FR', '2026-05-16T05:23:16.908518')
  returning id into v_new_id;
  v_property_ids := array_append(v_property_ids, v_new_id);

  insert into properties (agency_id, type, transaction_type, status, title, price, surface_m2, rooms, bedrooms, city, postal_code, country, created_at)
  values (v_agency_id, 'terrain', 'vente', 'available', 'Terrain à Bron', 75000.0, 525, null, null, 'Bron', '69001', 'FR', '2026-04-29T05:23:16.908534')
  returning id into v_new_id;
  v_property_ids := array_append(v_property_ids, v_new_id);

  insert into properties (agency_id, type, transaction_type, status, title, price, surface_m2, rooms, bedrooms, city, postal_code, country, created_at)
  values (v_agency_id, 'terrain', 'vente', 'available', 'Terrain à Bron', 77000.0, 648, null, null, 'Bron', '69006', 'FR', '2026-05-06T05:23:16.908545')
  returning id into v_new_id;
  v_property_ids := array_append(v_property_ids, v_new_id);

  insert into properties (agency_id, type, transaction_type, status, title, price, surface_m2, rooms, bedrooms, city, postal_code, country, created_at)
  values (v_agency_id, 'appartement', 'location', 'available', 'Appartement à Villeurbanne', 2357, 116, 4, 3, 'Villeurbanne', '69001', 'FR', '2026-05-03T05:23:16.908556')
  returning id into v_new_id;
  v_property_ids := array_append(v_property_ids, v_new_id);

  insert into properties (agency_id, type, transaction_type, status, title, price, surface_m2, rooms, bedrooms, city, postal_code, country, created_at)
  values (v_agency_id, 'maison', 'vente', 'under_offer', 'Maison à Bron', 185600.0, 45, 1, null, 'Bron', '69006', 'FR', '2026-05-15T05:23:16.908568')
  returning id into v_new_id;
  v_property_ids := array_append(v_property_ids, v_new_id);

  insert into properties (agency_id, type, transaction_type, status, title, price, surface_m2, rooms, bedrooms, city, postal_code, country, created_at)
  values (v_agency_id, 'terrain', 'vente', 'under_offer', 'Terrain à Villeurbanne', 59700.0, 346, null, null, 'Villeurbanne', '69004', 'FR', '2026-06-18T05:23:16.908577')
  returning id into v_new_id;
  v_property_ids := array_append(v_property_ids, v_new_id);

  insert into properties (agency_id, type, transaction_type, status, title, price, surface_m2, rooms, bedrooms, city, postal_code, country, created_at)
  values (v_agency_id, 'appartement', 'vente', 'available', 'Appartement à Vénissieux', 376500.0, 118, 4, 3, 'Vénissieux', '69005', 'FR', '2026-05-12T05:23:16.908587')
  returning id into v_new_id;
  v_property_ids := array_append(v_property_ids, v_new_id);

  insert into properties (agency_id, type, transaction_type, status, title, price, surface_m2, rooms, bedrooms, city, postal_code, country, created_at)
  values (v_agency_id, 'maison', 'vente', 'available', 'Maison à Écully', 258000.0, 66, 2, 1, 'Écully', '69009', 'FR', '2026-04-25T05:23:16.908597')
  returning id into v_new_id;
  v_property_ids := array_append(v_property_ids, v_new_id);

  insert into properties (agency_id, type, transaction_type, status, title, price, surface_m2, rooms, bedrooms, city, postal_code, country, created_at)
  values (v_agency_id, 'terrain', 'vente', 'available', 'Terrain à Oullins', 218100.0, 1163, null, null, 'Oullins', '69001', 'FR', '2026-05-02T05:23:16.908605')
  returning id into v_new_id;
  v_property_ids := array_append(v_property_ids, v_new_id);

  insert into properties (agency_id, type, transaction_type, status, title, price, surface_m2, rooms, bedrooms, city, postal_code, country, created_at)
  values (v_agency_id, 'appartement', 'vente', 'available', 'Appartement à Villeurbanne', 394300.0, 79, 2, 1, 'Villeurbanne', '69006', 'FR', '2026-05-09T05:23:16.908613')
  returning id into v_new_id;
  v_property_ids := array_append(v_property_ids, v_new_id);

  insert into properties (agency_id, type, transaction_type, status, title, price, surface_m2, rooms, bedrooms, city, postal_code, country, created_at)
  values (v_agency_id, 'terrain', 'vente', 'available', 'Terrain à Vénissieux', 143700.0, 705, null, null, 'Vénissieux', '69005', 'FR', '2026-06-14T05:23:16.908621')
  returning id into v_new_id;
  v_property_ids := array_append(v_property_ids, v_new_id);

  insert into properties (agency_id, type, transaction_type, status, title, price, surface_m2, rooms, bedrooms, city, postal_code, country, created_at)
  values (v_agency_id, 'maison', 'vente', 'available', 'Maison à Bron', 654000.0, 174, 6, 5, 'Bron', '69009', 'FR', '2026-06-15T05:23:16.908631')
  returning id into v_new_id;
  v_property_ids := array_append(v_property_ids, v_new_id);

  insert into properties (agency_id, type, transaction_type, status, title, price, surface_m2, rooms, bedrooms, city, postal_code, country, created_at)
  values (v_agency_id, 'appartement', 'vente', 'under_offer', 'Appartement à Villeurbanne', 275600.0, 64, 2, 1, 'Villeurbanne', '69002', 'FR', '2026-05-27T05:23:16.908641')
  returning id into v_new_id;
  v_property_ids := array_append(v_property_ids, v_new_id);

  insert into properties (agency_id, type, transaction_type, status, title, price, surface_m2, rooms, bedrooms, city, postal_code, country, created_at)
  values (v_agency_id, 'appartement', 'location', 'available', 'Appartement à Tassin-la-Demi-Lune', 3398, 166, 5, 4, 'Tassin-la-Demi-Lune', '69002', 'FR', '2026-05-08T05:23:16.908650')
  returning id into v_new_id;
  v_property_ids := array_append(v_property_ids, v_new_id);

  insert into properties (agency_id, type, transaction_type, status, title, price, surface_m2, rooms, bedrooms, city, postal_code, country, created_at)
  values (v_agency_id, 'local', 'vente', 'available', 'Local à Villeurbanne', 384300.0, 100, 3, 2, 'Villeurbanne', '69005', 'FR', '2026-05-08T05:23:16.908659')
  returning id into v_new_id;
  v_property_ids := array_append(v_property_ids, v_new_id);

  insert into properties (agency_id, type, transaction_type, status, title, price, surface_m2, rooms, bedrooms, city, postal_code, country, created_at)
  values (v_agency_id, 'maison', 'vente', 'available', 'Maison à Tassin-la-Demi-Lune', 656300.0, 154, 5, 4, 'Tassin-la-Demi-Lune', '69003', 'FR', '2026-05-06T05:23:16.908668')
  returning id into v_new_id;
  v_property_ids := array_append(v_property_ids, v_new_id);

  insert into properties (agency_id, type, transaction_type, status, title, price, surface_m2, rooms, bedrooms, city, postal_code, country, created_at)
  values (v_agency_id, 'maison', 'vente', 'available', 'Maison à Vénissieux', 89000.0, 29, 1, null, 'Vénissieux', '69005', 'FR', '2026-05-01T05:23:16.908676')
  returning id into v_new_id;
  v_property_ids := array_append(v_property_ids, v_new_id);

  insert into properties (agency_id, type, transaction_type, status, title, price, surface_m2, rooms, bedrooms, city, postal_code, country, created_at)
  values (v_agency_id, 'appartement', 'vente', 'under_offer', 'Appartement à Villeurbanne', 209600.0, 46, 1, null, 'Villeurbanne', '69009', 'FR', '2026-05-06T05:23:16.908711')
  returning id into v_new_id;
  v_property_ids := array_append(v_property_ids, v_new_id);

  insert into properties (agency_id, type, transaction_type, status, title, price, surface_m2, rooms, bedrooms, city, postal_code, country, created_at)
  values (v_agency_id, 'maison', 'location', 'available', 'Maison à Caluire-et-Cuire', 1546, 92, 3, 2, 'Caluire-et-Cuire', '69009', 'FR', '2026-06-10T05:23:16.908728')
  returning id into v_new_id;
  v_property_ids := array_append(v_property_ids, v_new_id);

  insert into contacts (agency_id, type, first_name, last_name, email, phone, source, notes, created_at)
  values (v_agency_id, 'lead', 'Maxime', 'Simon', 'maxime.simon0@example.com', '0697225156', 'Site web', 'A appelé suite à une annonce, demande plus de photos avant de s''engager.', '2026-05-21T05:23:16.908858')
  returning id into v_new_id;
  v_contact_ids := array_append(v_contact_ids, v_new_id);

  insert into contacts (agency_id, type, first_name, last_name, email, phone, source, notes, created_at)
  values (v_agency_id, 'lead', 'Jules', 'Leroy', 'jules.leroy1@example.com', '0655377076', 'SeLoger', null, '2026-05-19T05:23:16.908875')
  returning id into v_new_id;
  v_contact_ids := array_append(v_contact_ids, v_new_id);

  insert into contacts (agency_id, type, first_name, last_name, email, phone, source, notes, created_at)
  values (v_agency_id, 'lead', 'Victor', 'Leroy', 'victor.leroy2@example.com', '0694705205', 'SeLoger', 'Très motivé, mutation professionnelle dans 2 mois, recherche active.', '2026-06-19T05:23:16.908887')
  returning id into v_new_id;
  v_contact_ids := array_append(v_contact_ids, v_new_id);

  insert into contacts (agency_id, type, first_name, last_name, email, phone, source, notes, created_at)
  values (v_agency_id, 'lead', 'Raphaël', 'Dubois', 'raphael.dubois3@example.com', '0647376585', null, 'A appelé suite à une annonce, demande plus de photos avant de s''engager.', '2026-06-10T05:23:16.908953')
  returning id into v_new_id;
  v_contact_ids := array_append(v_contact_ids, v_new_id);

  insert into contacts (agency_id, type, first_name, last_name, email, phone, source, notes, created_at)
  values (v_agency_id, 'lead', 'Lucie', 'Fournier', 'lucie.fournier4@example.com', '0642614537', 'Bouche-à-oreille', 'Recommandé par un client satisfait. Sérieux, disponible rapidement.', '2026-06-11T05:23:16.908969')
  returning id into v_new_id;
  v_contact_ids := array_append(v_contact_ids, v_new_id);

  insert into contacts (agency_id, type, first_name, last_name, email, phone, source, notes, created_at)
  values (v_agency_id, 'lead', 'Chloé', 'Garcia', 'chloe.garcia5@example.com', '0665177213', 'Bouche-à-oreille', 'Cherche à acheter rapidement, vend déjà son bien actuel. Financement validé par sa banque.', '2026-05-11T05:23:16.908986')
  returning id into v_new_id;
  v_contact_ids := array_append(v_contact_ids, v_new_id);

  insert into contacts (agency_id, type, first_name, last_name, email, phone, source, notes, created_at)
  values (v_agency_id, 'client', 'Hugo', 'Michel', 'hugo.michel6@example.com', '0624665841', 'LeBonCoin', 'Très motivé, mutation professionnelle dans 2 mois, recherche active.', '2026-06-11T05:23:16.908997')
  returning id into v_new_id;
  v_contact_ids := array_append(v_contact_ids, v_new_id);

  insert into contacts (agency_id, type, first_name, last_name, email, phone, source, notes, created_at)
  values (v_agency_id, 'lead', 'Manon', 'Garcia', 'manon.garcia7@example.com', '0672092888', 'LeBonCoin', 'Premier contact via le site web, encore en phase de réflexion, pas urgent.', '2026-05-26T05:23:16.909006')
  returning id into v_new_id;
  v_contact_ids := array_append(v_contact_ids, v_new_id);

  insert into contacts (agency_id, type, first_name, last_name, email, phone, source, notes, created_at)
  values (v_agency_id, 'client', 'Hugo', 'Vincent', 'hugo.vincent8@example.com', '0622517517', 'LeBonCoin', 'A déjà visité 2 biens similaires sans donner suite. Budget serré.', '2026-05-28T05:23:16.909014')
  returning id into v_new_id;
  v_contact_ids := array_append(v_contact_ids, v_new_id);

  insert into contacts (agency_id, type, first_name, last_name, email, phone, source, notes, created_at)
  values (v_agency_id, 'client', 'Clara', 'Durand', 'clara.durand9@example.com', '0617869910', 'LeBonCoin', 'Recommandé par un client satisfait. Sérieux, disponible rapidement.', '2026-06-23T05:23:16.909023')
  returning id into v_new_id;
  v_contact_ids := array_append(v_contact_ids, v_new_id);

  insert into contacts (agency_id, type, first_name, last_name, email, phone, source, notes, created_at)
  values (v_agency_id, 'lead', 'Zoé', 'David', 'zoe.david10@example.com', '0684593961', null, 'A appelé suite à une annonce, demande plus de photos avant de s''engager.', '2026-06-14T05:23:16.909032')
  returning id into v_new_id;
  v_contact_ids := array_append(v_contact_ids, v_new_id);

  insert into contacts (agency_id, type, first_name, last_name, email, phone, source, notes, created_at)
  values (v_agency_id, 'owner', 'Jade', 'Durand', 'jade.durand11@example.com', '0687736262', null, null, '2026-06-20T05:23:16.909040')
  returning id into v_new_id;
  v_contact_ids := array_append(v_contact_ids, v_new_id);

  insert into contacts (agency_id, type, first_name, last_name, email, phone, source, notes, created_at)
  values (v_agency_id, 'lead', 'Hugo', 'Bernard', 'hugo.bernard12@example.com', '0677491435', 'Walk-in agence', 'A déjà visité 2 biens similaires sans donner suite. Budget serré.', '2026-06-20T05:23:16.909049')
  returning id into v_new_id;
  v_contact_ids := array_append(v_contact_ids, v_new_id);

  insert into contacts (agency_id, type, first_name, last_name, email, phone, source, notes, created_at)
  values (v_agency_id, 'lead', 'Nathan', 'Dubois', 'nathan.dubois13@example.com', '0641568532', 'Bouche-à-oreille', 'Premier contact via le site web, encore en phase de réflexion, pas urgent.', '2026-05-18T05:23:16.909057')
  returning id into v_new_id;
  v_contact_ids := array_append(v_contact_ids, v_new_id);

  insert into contacts (agency_id, type, first_name, last_name, email, phone, source, notes, created_at)
  values (v_agency_id, 'lead', 'Victor', 'Morel', 'victor.morel14@example.com', '0621003626', 'Bouche-à-oreille', null, '2026-05-18T05:23:16.909065')
  returning id into v_new_id;
  v_contact_ids := array_append(v_contact_ids, v_new_id);

  insert into contacts (agency_id, type, first_name, last_name, email, phone, source, notes, created_at)
  values (v_agency_id, 'lead', 'Zoé', 'Durand', 'zoe.durand15@example.com', '0652169044', 'LeBonCoin', 'Investisseur, cherche un bon rendement locatif, pas presse.', '2026-05-29T05:23:16.909074')
  returning id into v_new_id;
  v_contact_ids := array_append(v_contact_ids, v_new_id);

  insert into contacts (agency_id, type, first_name, last_name, email, phone, source, notes, created_at)
  values (v_agency_id, 'lead', 'Romane', 'Simon', 'romane.simon16@example.com', '0619736572', 'SeLoger', 'A appelé suite à une annonce, demande plus de photos avant de s''engager.', '2026-05-15T05:23:16.909082')
  returning id into v_new_id;
  v_contact_ids := array_append(v_contact_ids, v_new_id);

  insert into contacts (agency_id, type, first_name, last_name, email, phone, source, notes, created_at)
  values (v_agency_id, 'lead', 'Léa', 'Vincent', 'lea.vincent17@example.com', '0645594597', 'LeBonCoin', 'Jeune couple, premier achat, encore en train de monter le dossier de prêt.', '2026-06-19T05:23:16.909091')
  returning id into v_new_id;
  v_contact_ids := array_append(v_contact_ids, v_new_id);

  insert into contacts (agency_id, type, first_name, last_name, email, phone, source, notes, created_at)
  values (v_agency_id, 'lead', 'Gabriel', 'Simon', 'gabriel.simon18@example.com', '0682909480', null, 'Investisseur, cherche un bon rendement locatif, pas presse.', '2026-05-15T05:23:16.909099')
  returning id into v_new_id;
  v_contact_ids := array_append(v_contact_ids, v_new_id);

  insert into contacts (agency_id, type, first_name, last_name, email, phone, source, notes, created_at)
  values (v_agency_id, 'lead', 'Romane', 'Vincent', 'romane.vincent19@example.com', '0699038526', 'SeLoger', 'A déjà visité 2 biens similaires sans donner suite. Budget serré.', '2026-06-07T05:23:16.909107')
  returning id into v_new_id;
  v_contact_ids := array_append(v_contact_ids, v_new_id);

  insert into contacts (agency_id, type, first_name, last_name, email, phone, source, notes, created_at)
  values (v_agency_id, 'lead', 'Chloé', 'Vincent', 'chloe.vincent20@example.com', '0647816686', 'Walk-in agence', 'Très motivé, mutation professionnelle dans 2 mois, recherche active.', '2026-06-02T05:23:16.909116')
  returning id into v_new_id;
  v_contact_ids := array_append(v_contact_ids, v_new_id);

  insert into contacts (agency_id, type, first_name, last_name, email, phone, source, notes, created_at)
  values (v_agency_id, 'lead', 'Théo', 'Moreau', 'theo.moreau21@example.com', '0643704923', 'SeLoger', 'Premier contact via le site web, encore en phase de réflexion, pas urgent.', '2026-05-14T05:23:16.909124')
  returning id into v_new_id;
  v_contact_ids := array_append(v_contact_ids, v_new_id);

  insert into contacts (agency_id, type, first_name, last_name, email, phone, source, notes, created_at)
  values (v_agency_id, 'lead', 'Enzo', 'Bernard', 'enzo.bernard22@example.com', '0627558317', null, 'Investisseur, cherche un bon rendement locatif, pas presse.', '2026-06-13T05:23:16.909131')
  returning id into v_new_id;
  v_contact_ids := array_append(v_contact_ids, v_new_id);

  insert into contacts (agency_id, type, first_name, last_name, email, phone, source, notes, created_at)
  values (v_agency_id, 'lead', 'Liam', 'Garcia', 'liam.garcia23@example.com', '0625015458', 'SeLoger', 'A déjà visité 2 biens similaires sans donner suite. Budget serré.', '2026-05-20T05:23:16.909147')
  returning id into v_new_id;
  v_contact_ids := array_append(v_contact_ids, v_new_id);

  insert into contacts (agency_id, type, first_name, last_name, email, phone, source, notes, created_at)
  values (v_agency_id, 'lead', 'Gabriel', 'Fournier', 'gabriel.fournier24@example.com', '0667684996', 'LeBonCoin', 'Cherche à acheter rapidement, vend déjà son bien actuel. Financement validé par sa banque.', '2026-06-04T05:23:16.909157')
  returning id into v_new_id;
  v_contact_ids := array_append(v_contact_ids, v_new_id);

  insert into contacts (agency_id, type, first_name, last_name, email, phone, source, notes, created_at)
  values (v_agency_id, 'lead', 'Emma', 'Lefebvre', 'emma.lefebvre25@example.com', '0643491314', null, 'Premier contact via le site web, encore en phase de réflexion, pas urgent.', '2026-06-01T05:23:16.909166')
  returning id into v_new_id;
  v_contact_ids := array_append(v_contact_ids, v_new_id);

  insert into contacts (agency_id, type, first_name, last_name, email, phone, source, notes, created_at)
  values (v_agency_id, 'owner', 'Paul', 'Robert', 'paul.robert26@example.com', '0641774346', 'LeBonCoin', 'A déjà visité 2 biens similaires sans donner suite. Budget serré.', '2026-05-28T05:23:16.909174')
  returning id into v_new_id;
  v_contact_ids := array_append(v_contact_ids, v_new_id);

  insert into contacts (agency_id, type, first_name, last_name, email, phone, source, notes, created_at)
  values (v_agency_id, 'client', 'Nathan', 'Laurent', 'nathan.laurent27@example.com', '0665259205', null, 'Très motivé, mutation professionnelle dans 2 mois, recherche active.', '2026-06-06T05:23:16.909183')
  returning id into v_new_id;
  v_contact_ids := array_append(v_contact_ids, v_new_id);

  insert into contacts (agency_id, type, first_name, last_name, email, phone, source, notes, created_at)
  values (v_agency_id, 'lead', 'Capucine', 'Thomas', 'capucine.thomas28@example.com', '0615197528', 'Bouche-à-oreille', 'Très motivé, mutation professionnelle dans 2 mois, recherche active.', '2026-06-11T05:23:16.909193')
  returning id into v_new_id;
  v_contact_ids := array_append(v_contact_ids, v_new_id);

  insert into contacts (agency_id, type, first_name, last_name, email, phone, source, notes, created_at)
  values (v_agency_id, 'client', 'Louise', 'Simon', 'louise.simon29@example.com', '0640547349', 'LeBonCoin', 'Cherche à acheter rapidement, vend déjà son bien actuel. Financement validé par sa banque.', '2026-05-12T05:23:16.909201')
  returning id into v_new_id;
  v_contact_ids := array_append(v_contact_ids, v_new_id);

  insert into contacts (agency_id, type, first_name, last_name, email, phone, source, notes, created_at)
  values (v_agency_id, 'lead', 'Arthur', 'Laurent', 'arthur.laurent30@example.com', '0619317495', 'Site web', 'Jeune couple, premier achat, encore en train de monter le dossier de prêt.', '2026-05-13T05:23:16.909289')
  returning id into v_new_id;
  v_contact_ids := array_append(v_contact_ids, v_new_id);

  insert into contacts (agency_id, type, first_name, last_name, email, phone, source, notes, created_at)
  values (v_agency_id, 'lead', 'Théo', 'Vincent', 'theo.vincent31@example.com', '0613704481', 'SeLoger', 'Investisseur, cherche un bon rendement locatif, pas presse.', '2026-06-12T05:23:16.909301')
  returning id into v_new_id;
  v_contact_ids := array_append(v_contact_ids, v_new_id);

  insert into contacts (agency_id, type, first_name, last_name, email, phone, source, notes, created_at)
  values (v_agency_id, 'lead', 'Emma', 'Thomas', 'emma.thomas32@example.com', '0656397338', null, 'Jeune couple, premier achat, encore en train de monter le dossier de prêt.', '2026-05-27T05:23:16.909309')
  returning id into v_new_id;
  v_contact_ids := array_append(v_contact_ids, v_new_id);

  insert into contacts (agency_id, type, first_name, last_name, email, phone, source, notes, created_at)
  values (v_agency_id, 'lead', 'Alice', 'Fournier', 'alice.fournier33@example.com', '0615957459', null, 'Recommandé par un client satisfait. Sérieux, disponible rapidement.', '2026-06-23T05:23:16.909318')
  returning id into v_new_id;
  v_contact_ids := array_append(v_contact_ids, v_new_id);

  insert into contacts (agency_id, type, first_name, last_name, email, phone, source, notes, created_at)
  values (v_agency_id, 'lead', 'Gabriel', 'Garcia', 'gabriel.garcia34@example.com', '0699152472', 'Site web', null, '2026-06-03T05:23:16.909326')
  returning id into v_new_id;
  v_contact_ids := array_append(v_contact_ids, v_new_id);

  insert into contacts (agency_id, type, first_name, last_name, email, phone, source, notes, created_at)
  values (v_agency_id, 'lead', 'Lucie', 'Simon', 'lucie.simon35@example.com', '0699508850', 'Bouche-à-oreille', 'Jeune couple, premier achat, encore en train de monter le dossier de prêt.', '2026-05-29T05:23:16.909333')
  returning id into v_new_id;
  v_contact_ids := array_append(v_contact_ids, v_new_id);

  insert into contacts (agency_id, type, first_name, last_name, email, phone, source, notes, created_at)
  values (v_agency_id, 'lead', 'Liam', 'Robert', 'liam.robert36@example.com', '0699245317', 'Bouche-à-oreille', 'A déjà visité 2 biens similaires sans donner suite. Budget serré.', '2026-05-15T05:23:16.909342')
  returning id into v_new_id;
  v_contact_ids := array_append(v_contact_ids, v_new_id);

  insert into contacts (agency_id, type, first_name, last_name, email, phone, source, notes, created_at)
  values (v_agency_id, 'client', 'Arthur', 'Vincent', 'arthur.vincent37@example.com', '0650785405', 'Site web', 'Très motivé, mutation professionnelle dans 2 mois, recherche active.', '2026-05-27T05:23:16.909351')
  returning id into v_new_id;
  v_contact_ids := array_append(v_contact_ids, v_new_id);

  insert into contacts (agency_id, type, first_name, last_name, email, phone, source, notes, created_at)
  values (v_agency_id, 'lead', 'Maël', 'David', 'mael.david38@example.com', '0638682516', 'Walk-in agence', 'A appelé suite à une annonce, demande plus de photos avant de s''engager.', '2026-06-13T05:23:16.909360')
  returning id into v_new_id;
  v_contact_ids := array_append(v_contact_ids, v_new_id);

  insert into contacts (agency_id, type, first_name, last_name, email, phone, source, notes, created_at)
  values (v_agency_id, 'lead', 'Jade', 'Roux', 'jade.roux39@example.com', '0693115778', 'Site web', 'Premier contact via le site web, encore en phase de réflexion, pas urgent.', '2026-06-08T05:23:16.909368')
  returning id into v_new_id;
  v_contact_ids := array_append(v_contact_ids, v_new_id);

  insert into contacts (agency_id, type, first_name, last_name, email, phone, source, notes, created_at)
  values (v_agency_id, 'lead', 'Lina', 'Durand', 'lina.durand40@example.com', '0616202700', 'LeBonCoin', 'A appelé suite à une annonce, demande plus de photos avant de s''engager.', '2026-05-15T05:23:16.909376')
  returning id into v_new_id;
  v_contact_ids := array_append(v_contact_ids, v_new_id);

  insert into contacts (agency_id, type, first_name, last_name, email, phone, source, notes, created_at)
  values (v_agency_id, 'client', 'Maël', 'Garcia', 'mael.garcia41@example.com', '0687265240', 'LeBonCoin', 'Recommandé par un client satisfait. Sérieux, disponible rapidement.', '2026-05-23T05:23:16.909384')
  returning id into v_new_id;
  v_contact_ids := array_append(v_contact_ids, v_new_id);

  insert into contacts (agency_id, type, first_name, last_name, email, phone, source, notes, created_at)
  values (v_agency_id, 'lead', 'Mathis', 'Robert', 'mathis.robert42@example.com', '0610744212', 'SeLoger', 'Recommandé par un client satisfait. Sérieux, disponible rapidement.', '2026-06-09T05:23:16.909424')
  returning id into v_new_id;
  v_contact_ids := array_append(v_contact_ids, v_new_id);

  insert into contacts (agency_id, type, first_name, last_name, email, phone, source, notes, created_at)
  values (v_agency_id, 'lead', 'Capucine', 'Roux', 'capucine.roux43@example.com', '0684813739', 'LeBonCoin', 'Premier contact via le site web, encore en phase de réflexion, pas urgent.', '2026-05-25T05:23:16.909439')
  returning id into v_new_id;
  v_contact_ids := array_append(v_contact_ids, v_new_id);

  insert into contacts (agency_id, type, first_name, last_name, email, phone, source, notes, created_at)
  values (v_agency_id, 'owner', 'Maël', 'Roux', 'mael.roux44@example.com', '0689920257', 'Site web', 'A appelé suite à une annonce, demande plus de photos avant de s''engager.', '2026-05-15T05:23:16.909449')
  returning id into v_new_id;
  v_contact_ids := array_append(v_contact_ids, v_new_id);

  insert into contacts (agency_id, type, first_name, last_name, email, phone, source, notes, created_at)
  values (v_agency_id, 'client', 'Liam', 'David', 'liam.david45@example.com', '0673709724', 'Bouche-à-oreille', 'Investisseur, cherche un bon rendement locatif, pas presse.', '2026-06-08T05:23:16.909458')
  returning id into v_new_id;
  v_contact_ids := array_append(v_contact_ids, v_new_id);

  insert into contacts (agency_id, type, first_name, last_name, email, phone, source, notes, created_at)
  values (v_agency_id, 'lead', 'Aaron', 'Roux', 'aaron.roux46@example.com', '0642111036', 'Site web', 'A appelé suite à une annonce, demande plus de photos avant de s''engager.', '2026-06-19T05:23:16.909466')
  returning id into v_new_id;
  v_contact_ids := array_append(v_contact_ids, v_new_id);

  insert into contacts (agency_id, type, first_name, last_name, email, phone, source, notes, created_at)
  values (v_agency_id, 'lead', 'Mathis', 'Moreau', 'mathis.moreau47@example.com', '0682498004', 'SeLoger', 'A déjà visité 2 biens similaires sans donner suite. Budget serré.', '2026-06-14T05:23:16.909476')
  returning id into v_new_id;
  v_contact_ids := array_append(v_contact_ids, v_new_id);

  insert into contacts (agency_id, type, first_name, last_name, email, phone, source, notes, created_at)
  values (v_agency_id, 'client', 'Alice', 'Robert', 'alice.robert48@example.com', '0618620650', 'Bouche-à-oreille', 'Recommandé par un client satisfait. Sérieux, disponible rapidement.', '2026-06-02T05:23:16.909483')
  returning id into v_new_id;
  v_contact_ids := array_append(v_contact_ids, v_new_id);

  insert into contacts (agency_id, type, first_name, last_name, email, phone, source, notes, created_at)
  values (v_agency_id, 'lead', 'Juliette', 'Bernard', 'juliette.bernard49@example.com', '0666390708', 'Bouche-à-oreille', null, '2026-05-10T05:23:16.909492')
  returning id into v_new_id;
  v_contact_ids := array_append(v_contact_ids, v_new_id);

  -- Associations contact <-> bien (leads)
  insert into leads (agency_id, contact_id, property_id, status, budget_min, budget_max, created_at) values (v_agency_id, v_contact_ids[49], v_property_ids[19], 'qualified', 153000, 218000, '2026-06-04T05:23:16.909501');
  insert into leads (agency_id, contact_id, property_id, status, budget_min, budget_max, created_at) values (v_agency_id, v_contact_ids[27], v_property_ids[18], 'negotiation', 429000, 526000, '2026-06-09T05:23:16.909512');
  insert into leads (agency_id, contact_id, property_id, status, budget_min, budget_max, created_at) values (v_agency_id, v_contact_ids[15], v_property_ids[9], 'qualified', 164000, 233000, '2026-06-02T05:23:16.909518');
  insert into leads (agency_id, contact_id, property_id, status, budget_min, budget_max, created_at) values (v_agency_id, v_contact_ids[47], v_property_ids[6], 'lost', 215000, 314000, '2026-05-20T05:23:16.909524');
  insert into leads (agency_id, contact_id, property_id, status, budget_min, budget_max, created_at) values (v_agency_id, v_contact_ids[26], v_property_ids[19], 'visit_scheduled', 163000, 193000, '2026-05-27T05:23:16.909529');
  insert into leads (agency_id, contact_id, property_id, status, budget_min, budget_max, created_at) values (v_agency_id, v_contact_ids[30], v_property_ids[6], 'new', 344000, 405000, '2026-06-10T05:23:16.909534');
  insert into leads (agency_id, contact_id, property_id, status, budget_min, budget_max, created_at) values (v_agency_id, v_contact_ids[21], v_property_ids[11], 'won', 344000, 399000, '2026-05-28T05:23:16.909539');
  insert into leads (agency_id, contact_id, property_id, status, budget_min, budget_max, created_at) values (v_agency_id, v_contact_ids[6], v_property_ids[16], 'new', 426000, 452000, '2026-06-01T05:23:16.909543');
  insert into leads (agency_id, contact_id, property_id, status, budget_min, budget_max, created_at) values (v_agency_id, v_contact_ids[42], v_property_ids[3], 'won', 483000, 508000, '2026-06-22T05:23:16.909548');
  insert into leads (agency_id, contact_id, property_id, status, budget_min, budget_max, created_at) values (v_agency_id, v_contact_ids[13], v_property_ids[1], 'visit_scheduled', 272000, 308000, '2026-05-24T05:23:16.909553');
  insert into leads (agency_id, contact_id, property_id, status, budget_min, budget_max, created_at) values (v_agency_id, v_contact_ids[37], v_property_ids[7], 'qualified', 281000, 348000, '2026-06-13T05:23:16.909558');
  insert into leads (agency_id, contact_id, property_id, status, budget_min, budget_max, created_at) values (v_agency_id, v_contact_ids[50], v_property_ids[6], 'lost', 205000, 299000, '2026-06-22T05:23:16.909563');
  insert into leads (agency_id, contact_id, property_id, status, budget_min, budget_max, created_at) values (v_agency_id, v_contact_ids[37], v_property_ids[13], 'qualified', 516000, 561000, '2026-06-19T05:23:16.909568');
  insert into leads (agency_id, contact_id, property_id, status, budget_min, budget_max, created_at) values (v_agency_id, v_contact_ids[7], v_property_ids[10], 'lost', 457000, 492000, '2026-05-18T05:23:16.909573');
  insert into leads (agency_id, contact_id, property_id, status, budget_min, budget_max, created_at) values (v_agency_id, v_contact_ids[23], v_property_ids[18], 'qualified', 339000, 367000, '2026-05-22T05:23:16.909577');
  insert into leads (agency_id, contact_id, property_id, status, budget_min, budget_max, created_at) values (v_agency_id, v_contact_ids[1], v_property_ids[14], 'won', 204000, 279000, '2026-05-31T05:23:16.909582');
  insert into leads (agency_id, contact_id, property_id, status, budget_min, budget_max, created_at) values (v_agency_id, v_contact_ids[46], v_property_ids[5], 'qualified', 525000, 611000, '2026-06-06T05:23:16.909587');
  insert into leads (agency_id, contact_id, property_id, status, budget_min, budget_max, created_at) values (v_agency_id, v_contact_ids[30], v_property_ids[14], 'won', 453000, 507000, '2026-06-03T05:23:16.909592');
  insert into leads (agency_id, contact_id, property_id, status, budget_min, budget_max, created_at) values (v_agency_id, v_contact_ids[6], v_property_ids[9], 'lost', 274000, 353000, '2026-05-18T05:23:16.909597');
  insert into leads (agency_id, contact_id, property_id, status, budget_min, budget_max, created_at) values (v_agency_id, v_contact_ids[22], v_property_ids[1], 'qualified', 316000, 359000, '2026-05-23T05:23:16.909603');
  insert into leads (agency_id, contact_id, property_id, status, budget_min, budget_max, created_at) values (v_agency_id, v_contact_ids[23], v_property_ids[9], 'qualified', 455000, 510000, '2026-05-19T05:23:16.909608');
  insert into leads (agency_id, contact_id, property_id, status, budget_min, budget_max, created_at) values (v_agency_id, v_contact_ids[34], v_property_ids[7], 'new', 518000, 590000, '2026-05-23T05:23:16.909613');
  insert into leads (agency_id, contact_id, property_id, status, budget_min, budget_max, created_at) values (v_agency_id, v_contact_ids[45], v_property_ids[16], 'visit_scheduled', 401000, 478000, '2026-06-22T05:23:16.909617');
  insert into leads (agency_id, contact_id, property_id, status, budget_min, budget_max, created_at) values (v_agency_id, v_contact_ids[19], v_property_ids[8], 'qualified', 274000, 333000, '2026-05-17T05:23:16.909622');
  insert into leads (agency_id, contact_id, property_id, status, budget_min, budget_max, created_at) values (v_agency_id, v_contact_ids[31], v_property_ids[18], 'visit_scheduled', 367000, 457000, '2026-06-02T05:23:16.909626');
  insert into leads (agency_id, contact_id, property_id, status, budget_min, budget_max, created_at) values (v_agency_id, v_contact_ids[45], v_property_ids[15], 'qualified', 278000, 327000, '2026-06-16T05:23:16.909631');
  insert into leads (agency_id, contact_id, property_id, status, budget_min, budget_max, created_at) values (v_agency_id, v_contact_ids[21], v_property_ids[4], 'negotiation', 540000, 583000, '2026-06-11T05:23:16.909637');
  insert into leads (agency_id, contact_id, property_id, status, budget_min, budget_max, created_at) values (v_agency_id, v_contact_ids[48], v_property_ids[16], 'qualified', 451000, 538000, '2026-05-16T05:23:16.909645');
  insert into leads (agency_id, contact_id, property_id, status, budget_min, budget_max, created_at) values (v_agency_id, v_contact_ids[7], v_property_ids[7], 'qualified', 334000, 376000, '2026-06-04T05:23:16.909650');
  insert into leads (agency_id, contact_id, property_id, status, budget_min, budget_max, created_at) values (v_agency_id, v_contact_ids[46], v_property_ids[18], 'new', 173000, 199000, '2026-05-19T05:23:16.909655');
  insert into leads (agency_id, contact_id, property_id, status, budget_min, budget_max, created_at) values (v_agency_id, v_contact_ids[45], v_property_ids[5], 'visit_scheduled', 535000, 617000, '2026-06-17T05:23:16.909659');
  insert into leads (agency_id, contact_id, property_id, status, budget_min, budget_max, created_at) values (v_agency_id, v_contact_ids[37], v_property_ids[10], 'qualified', 375000, 438000, '2026-06-12T05:23:16.909664');
  insert into leads (agency_id, contact_id, property_id, status, budget_min, budget_max, created_at) values (v_agency_id, v_contact_ids[17], v_property_ids[16], 'new', 183000, 254000, '2026-05-23T05:23:16.909669');
  insert into leads (agency_id, contact_id, property_id, status, budget_min, budget_max, created_at) values (v_agency_id, v_contact_ids[37], v_property_ids[2], 'new', 438000, 496000, '2026-06-18T05:23:16.909674');
  insert into leads (agency_id, contact_id, property_id, status, budget_min, budget_max, created_at) values (v_agency_id, v_contact_ids[8], v_property_ids[18], 'won', 460000, 556000, '2026-05-15T05:23:16.909698');

  -- Rendez-vous (mélange passés et à venir)
  insert into appointments (agency_id, contact_id, property_id, type, scheduled_at, status, duration_minutes) values (v_agency_id, v_contact_ids[50], v_property_ids[17], 'visit', '2026-05-25T05:23:16.909709', 'done', 30);
  insert into appointments (agency_id, contact_id, property_id, type, scheduled_at, status, duration_minutes) values (v_agency_id, v_contact_ids[38], v_property_ids[14], 'visit', '2026-06-04T05:23:16.909721', 'done', 30);
  insert into appointments (agency_id, contact_id, property_id, type, scheduled_at, status, duration_minutes) values (v_agency_id, v_contact_ids[48], v_property_ids[4], 'signing', '2026-06-17T05:23:16.909730', 'done', 30);
  insert into appointments (agency_id, contact_id, property_id, type, scheduled_at, status, duration_minutes) values (v_agency_id, v_contact_ids[17], v_property_ids[3], 'visit', '2026-06-18T05:23:16.909738', 'done', 30);
  insert into appointments (agency_id, contact_id, property_id, type, scheduled_at, status, duration_minutes) values (v_agency_id, v_contact_ids[11], v_property_ids[1], 'visit', '2026-06-01T05:23:16.909745', 'done', 30);
  insert into appointments (agency_id, contact_id, property_id, type, scheduled_at, status, duration_minutes) values (v_agency_id, v_contact_ids[19], v_property_ids[2], 'visit', '2026-06-01T05:23:16.909749', 'done', 30);
  insert into appointments (agency_id, contact_id, property_id, type, scheduled_at, status, duration_minutes) values (v_agency_id, v_contact_ids[30], v_property_ids[3], 'visit', '2026-05-25T05:23:16.909754', 'done', 30);
  insert into appointments (agency_id, contact_id, property_id, type, scheduled_at, status, duration_minutes) values (v_agency_id, v_contact_ids[41], v_property_ids[19], 'visit', '2026-05-25T05:23:16.909759', 'done', 30);
  insert into appointments (agency_id, contact_id, property_id, type, scheduled_at, status, duration_minutes) values (v_agency_id, v_contact_ids[8], v_property_ids[18], 'visit', '2026-06-19T05:23:16.909764', 'canceled', 30);
  insert into appointments (agency_id, contact_id, property_id, type, scheduled_at, status, duration_minutes) values (v_agency_id, v_contact_ids[10], v_property_ids[3], 'visit', '2026-06-28T05:23:16.909769', 'scheduled', 30);
  insert into appointments (agency_id, contact_id, property_id, type, scheduled_at, status, duration_minutes) values (v_agency_id, v_contact_ids[37], v_property_ids[10], 'visit', '2026-07-01T05:23:16.909775', 'confirmed', 30);
  insert into appointments (agency_id, contact_id, property_id, type, scheduled_at, status, duration_minutes) values (v_agency_id, v_contact_ids[45], v_property_ids[13], 'signing', '2026-07-02T05:23:16.909782', 'scheduled', 30);
  insert into appointments (agency_id, contact_id, property_id, type, scheduled_at, status, duration_minutes) values (v_agency_id, v_contact_ids[29], v_property_ids[3], 'visit', '2026-06-30T05:23:16.909787', 'confirmed', 30);
  insert into appointments (agency_id, contact_id, property_id, type, scheduled_at, status, duration_minutes) values (v_agency_id, v_contact_ids[39], v_property_ids[9], 'visit', '2026-06-27T05:23:16.909792', 'confirmed', 30);
  insert into appointments (agency_id, contact_id, property_id, type, scheduled_at, status, duration_minutes) values (v_agency_id, v_contact_ids[37], v_property_ids[19], 'signing', '2026-07-04T05:23:16.909797', 'confirmed', 30);

  -- Messages (certains récents, d'autres anciens pour déclencher les relances recommandées)
  insert into messages (agency_id, contact_id, channel, direction, subject, body, status, sent_at) values (v_agency_id, v_contact_ids[37], 'email', 'outbound', 'Retour suite à notre échange', 'Message de démonstration pour peupler l''historique du contact.', 'sent', '2026-06-21T05:23:16.909805');
  insert into messages (agency_id, contact_id, channel, direction, subject, body, status, sent_at) values (v_agency_id, v_contact_ids[18], 'email', 'outbound', 'Retour suite à notre échange', 'Message de démonstration pour peupler l''historique du contact.', 'sent', '2026-05-27T05:23:16.909811');
  insert into messages (agency_id, contact_id, channel, direction, subject, body, status, sent_at) values (v_agency_id, v_contact_ids[6], 'email', 'outbound', 'Confirmation de visite', 'Message de démonstration pour peupler l''historique du contact.', 'sent', '2026-06-09T05:23:16.909817');
  insert into messages (agency_id, contact_id, channel, direction, subject, body, status, sent_at) values (v_agency_id, v_contact_ids[43], 'email', 'outbound', 'Confirmation de visite', 'Message de démonstration pour peupler l''historique du contact.', 'sent', '2026-06-21T05:23:16.909821');
  insert into messages (agency_id, contact_id, channel, direction, subject, body, status, sent_at) values (v_agency_id, v_contact_ids[45], 'email', 'outbound', 'Nouvelle opportunité', 'Message de démonstration pour peupler l''historique du contact.', 'sent', '2026-06-09T05:23:16.909825');
  insert into messages (agency_id, contact_id, channel, direction, subject, body, status, sent_at) values (v_agency_id, v_contact_ids[30], 'email', 'outbound', 'Confirmation de visite', 'Message de démonstration pour peupler l''historique du contact.', 'sent', '2026-06-16T05:23:16.909830');
  insert into messages (agency_id, contact_id, channel, direction, subject, body, status, sent_at) values (v_agency_id, v_contact_ids[50], 'email', 'outbound', 'Suivi de votre projet', 'Message de démonstration pour peupler l''historique du contact.', 'sent', '2026-06-02T05:23:16.909834');
  insert into messages (agency_id, contact_id, channel, direction, subject, body, status, sent_at) values (v_agency_id, v_contact_ids[27], 'email', 'outbound', 'Confirmation de visite', 'Message de démonstration pour peupler l''historique du contact.', 'sent', '2026-06-02T05:23:16.909839');
  insert into messages (agency_id, contact_id, channel, direction, subject, body, status, sent_at) values (v_agency_id, v_contact_ids[41], 'email', 'outbound', 'Bien disponible pour vous', 'Message de démonstration pour peupler l''historique du contact.', 'sent', '2026-06-23T05:23:16.909843');
  insert into messages (agency_id, contact_id, channel, direction, subject, body, status, sent_at) values (v_agency_id, v_contact_ids[36], 'email', 'outbound', 'Retour suite à notre échange', 'Message de démonstration pour peupler l''historique du contact.', 'sent', '2026-06-16T05:23:16.909847');
  insert into messages (agency_id, contact_id, channel, direction, subject, body, status, sent_at) values (v_agency_id, v_contact_ids[8], 'email', 'outbound', 'Bien disponible pour vous', 'Message de démonstration pour peupler l''historique du contact.', 'sent', '2026-05-27T05:23:16.909852');
  insert into messages (agency_id, contact_id, channel, direction, subject, body, status, sent_at) values (v_agency_id, v_contact_ids[20], 'email', 'outbound', 'Retour suite à notre échange', 'Message de démonstration pour peupler l''historique du contact.', 'sent', '2026-06-02T05:23:16.909856');
  insert into messages (agency_id, contact_id, channel, direction, subject, body, status, sent_at) values (v_agency_id, v_contact_ids[15], 'email', 'inbound', 'Retour suite à notre échange', 'Message de démonstration pour peupler l''historique du contact.', 'sent', '2026-06-22T05:23:16.909860');
  insert into messages (agency_id, contact_id, channel, direction, subject, body, status, sent_at) values (v_agency_id, v_contact_ids[42], 'email', 'inbound', 'Confirmation de visite', 'Message de démonstration pour peupler l''historique du contact.', 'sent', '2026-06-06T05:23:16.909864');
  insert into messages (agency_id, contact_id, channel, direction, subject, body, status, sent_at) values (v_agency_id, v_contact_ids[27], 'email', 'inbound', 'Bien disponible pour vous', 'Message de démonstration pour peupler l''historique du contact.', 'sent', '2026-06-06T05:23:16.909868');
  insert into messages (agency_id, contact_id, channel, direction, subject, body, status, sent_at) values (v_agency_id, v_contact_ids[36], 'email', 'outbound', 'Nouvelle opportunité', 'Message de démonstration pour peupler l''historique du contact.', 'sent', '2026-06-19T05:23:16.909872');
  insert into messages (agency_id, contact_id, channel, direction, subject, body, status, sent_at) values (v_agency_id, v_contact_ids[5], 'email', 'outbound', 'Confirmation de visite', 'Message de démonstration pour peupler l''historique du contact.', 'sent', '2026-06-09T05:23:16.909877');
  insert into messages (agency_id, contact_id, channel, direction, subject, body, status, sent_at) values (v_agency_id, v_contact_ids[1], 'email', 'outbound', 'Nouvelle opportunité', 'Message de démonstration pour peupler l''historique du contact.', 'sent', '2026-06-16T05:23:16.909881');
  insert into messages (agency_id, contact_id, channel, direction, subject, body, status, sent_at) values (v_agency_id, v_contact_ids[10], 'email', 'outbound', 'Confirmation de visite', 'Message de démonstration pour peupler l''historique du contact.', 'sent', '2026-06-06T05:23:16.909886');
  insert into messages (agency_id, contact_id, channel, direction, subject, body, status, sent_at) values (v_agency_id, v_contact_ids[36], 'email', 'inbound', 'Retour suite à notre échange', 'Message de démonstration pour peupler l''historique du contact.', 'sent', '2026-06-09T05:23:16.909891');
  insert into messages (agency_id, contact_id, channel, direction, subject, body, status, sent_at) values (v_agency_id, v_contact_ids[13], 'email', 'inbound', 'Nouvelle opportunité', 'Message de démonstration pour peupler l''historique du contact.', 'sent', '2026-06-19T05:23:16.909895');
  insert into messages (agency_id, contact_id, channel, direction, subject, body, status, sent_at) values (v_agency_id, v_contact_ids[15], 'email', 'inbound', 'Suivi de votre projet', 'Message de démonstration pour peupler l''historique du contact.', 'sent', '2026-06-09T05:23:16.909899');
  insert into messages (agency_id, contact_id, channel, direction, subject, body, status, sent_at) values (v_agency_id, v_contact_ids[48], 'email', 'outbound', 'Retour suite à notre échange', 'Message de démonstration pour peupler l''historique du contact.', 'sent', '2026-06-09T05:23:16.909903');
  insert into messages (agency_id, contact_id, channel, direction, subject, body, status, sent_at) values (v_agency_id, v_contact_ids[32], 'email', 'inbound', 'Nouvelle opportunité', 'Message de démonstration pour peupler l''historique du contact.', 'sent', '2026-06-21T05:23:16.909907');
  insert into messages (agency_id, contact_id, channel, direction, subject, body, status, sent_at) values (v_agency_id, v_contact_ids[7], 'email', 'inbound', 'Suivi de votre projet', 'Message de démonstration pour peupler l''historique du contact.', 'sent', '2026-06-06T05:23:16.909912');

  raise notice 'Données de démonstration insérées avec succès.';
end $$;