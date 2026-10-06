--Insertion des données dans les tableaux correspondants avec INSERT TO

INSERT INTO companies (name, description, location, website) VALUES
  ('TechNova', 'Studio de développement web', 'Paris', 'https://technova.example.com'),
  ('GreenWorks', 'Agence de design durable', 'Lyon', 'https://greenworks.example.com');

INSERT INTO categories (name) VALUES
  ('Développement'),
  ('Design'),
  ('Data');

INSERT INTO people (first_name, last_name, email, phone) VALUES
  ('Alice', 'Martin', 'alice.martin@example.com', '0600000001'),
  ('Bruno', 'Durand', 'bruno.durand@example.com', '0600000002'),
  ('Chloé', 'Petit', 'chloe.petit@example.com', NULL);

INSERT INTO ads (title, short_description, description, salary, location, working_time, contract_type, company_id, category_id, contact_id) VALUES
  ('Développeur Python', 'Back-end Flask', 'you will have to make website', 42000, 'Paris', 'Temps plein', 'CDI', 1, 1, 1),
  ('Data analyst', 'Analyse de données, SQL', 'you will have to analyse many data on many arrays', 52000, 'Mulhouse', '35h', 'Stage', 2, 2, 2),
  ('Cybersécurité', 'Blue team', 'you will have to defend our website against viruses', 100000, 'Londres', 'Temps plein', 'CDI', 1, 3, 3);

INSERT INTO applications (ad_id, person_id, message, created_at) VALUES
  (1, 1, 'Bonjour, votre offre correspond à mon profil.', '2025-01-10 09:00:00'),
  (1, 2, 'Bonjour, je souhaite rejoindre votre équipe.', '2025-01-11 14:30:00'),
  (1, 3, 'Bonjour, ce poste m''intéresse beaucoup.', '2025-01-12 18:45:00'),
  (2, 2, 'Bonjour, je candidate également à cette annonce.', '2025-01-13 10:15:00');
