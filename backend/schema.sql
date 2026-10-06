--suppression des tables si elles existent déjà dans la base de données. Sinon on passe à la suite.
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
  website TEXT
);

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
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin'))
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
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  company_id INTEGER NOT NULL REFERENCES companies(id),
  category_id INTEGER NOT NULL REFERENCES categories(id),
  contact_id INTEGER REFERENCES people(id)
);

CREATE TABLE applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ad_id INTEGER NOT NULL REFERENCES ads(id),
  person_id INTEGER NOT NULL REFERENCES people(id),
  message TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (ad_id, person_id)
);