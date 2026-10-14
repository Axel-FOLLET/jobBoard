--suppression des tables si elles existent déjà dans la base de données. Sinon on passe à la suite.
DROP TABLE IF EXISTS pending_registrations;
DROP TABLE IF EXISTS applications;
DROP TABLE IF EXISTS ads;
DROP TABLE IF EXISTS people;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS companies;

-- créations des tables (=tableaux) selon les différentes catégories du jobBoard. On indique les headers qu'on veut.
CREATE TABLE companies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  location TEXT,
  website TEXT,
  -- SIREN : texte de 9 chiffres (garde les zéros du début) ; NULL pour une ancienne fiche à compléter
  siren TEXT CHECK (siren IS NULL OR (length(siren) = 9 AND siren NOT GLOB '*[^0-9]*'))
);

-- Un SIREN renseigné n'apparaît qu'une fois (plusieurs NULL restent possibles).
-- Même index que celui créé par migrate_siren.py sur une base existante.
CREATE UNIQUE INDEX companies_siren_unique ON companies(siren);

CREATE TABLE categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE people (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  password_hash TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  -- entreprise du recruteur ; NULL par défaut : la personne n'est pas recruteur
  company_id INTEGER REFERENCES companies(id) ON DELETE RESTRICT
);

CREATE TABLE ads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  short_description TEXT NOT NULL,
  description TEXT,
  salary INTEGER,
  location TEXT,
  working_time TEXT,
  contract_type TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  company_id INTEGER NOT NULL,
  category_id INTEGER NOT NULL,
  contact_id INTEGER,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE RESTRICT,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
  FOREIGN KEY (contact_id) REFERENCES people(id) ON DELETE RESTRICT
);

CREATE TABLE applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ad_id INTEGER NOT NULL,
  person_id INTEGER NOT NULL,
  message TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  receipt_email_sent_at TEXT,
  decision_email_sent_at TEXT,
  UNIQUE (ad_id, person_id),
  FOREIGN KEY (ad_id) REFERENCES ads(id) ON DELETE RESTRICT,
  FOREIGN KEY (person_id) REFERENCES people(id) ON DELETE RESTRICT);
  

-- Inscription en attente : une personne déjà dans people sans mot de passe crée son compte.
-- Rien n’est appliqué à sa fiche avant le clic sur le lien envoyé à son adresse.
-- Seule l’empreinte SHA-256 du jeton est gardée ; le lien vaut 24 heures et ne sert qu’une fois.
-- Même définition que pending_registrations.py, qui crée la table sur une base déjà en place.
CREATE TABLE pending_registrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  person_id INTEGER NOT NULL UNIQUE,
  token_hash TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL,
  FOREIGN KEY (person_id) REFERENCES people(id) ON DELETE CASCADE
);