import os
import sqlite3
import sys

# Migration : ajoute le SIREN à companies sur une base EXISTANTE, sans la réinitialiser.
# Usage : python migrate_siren.py [fichier.db]   (par défaut : jobboard.db)
# À tester d'abord sur une copie : cp jobboard.db copie.db && python migrate_siren.py copie.db

DB_FILE = sys.argv[1] if len(sys.argv) > 1 else "jobboard.db"
TABLES = ("companies", "categories", "people", "ads", "applications")

# Même règle que dans schema.sql
SIREN_COLUMN = (
    "siren TEXT CHECK (siren IS NULL OR "
    "(length(siren) = 9 AND siren NOT GLOB '*[^0-9]*'))"
)

# sqlite3.connect créerait une base vide si le fichier n'existe pas
if not os.path.exists(DB_FILE):
    sys.exit(f"Base introuvable : {DB_FILE}")

# isolation_level=None : on ouvre et on valide la transaction nous-mêmes (BEGIN / COMMIT)
conn = sqlite3.connect(DB_FILE, isolation_level=None)
conn.execute("PRAGMA foreign_keys = ON")


def count_rows():
    return {
        table: conn.execute(f"SELECT COUNT(*) FROM {table}").fetchone()[0]
        for table in TABLES
    }


def ad_links():
    # liens annonce -> entreprise, pour vérifier qu'ils n'ont pas bougé
    return conn.execute("SELECT id, company_id FROM ads ORDER BY id").fetchall()


before_counts = count_rows()
before_links = ad_links()

# PRAGMA table_info : une ligne par colonne, le nom est en position 1
columns = [row[1] for row in conn.execute("PRAGMA table_info(companies)")]

conn.execute("BEGIN")
try:
    if "siren" in columns:
        print("Colonne siren déjà présente : rien à ajouter.")
    else:
        # les fiches existantes reçoivent NULL : on n'invente aucun SIREN
        conn.execute(f"ALTER TABLE companies ADD COLUMN {SIREN_COLUMN}")
        print("Colonne siren ajoutée (NULL pour les fiches existantes).")

    # ALTER TABLE ne sait pas ajouter UNIQUE : l'unicité passe par un index unique
    conn.execute(
        "CREATE UNIQUE INDEX IF NOT EXISTS companies_siren_unique "
        "ON companies(siren)"
    )
    conn.execute("COMMIT")
except sqlite3.Error as error:
    conn.execute("ROLLBACK")
    conn.close()
    sys.exit(f"Migration annulée, base inchangée : {error}")

# Vérifications : mêmes comptes, mêmes liens, aucune clé étrangère cassée
after_counts = count_rows()
problems = []

if after_counts != before_counts:
    problems.append(f"comptes différents : {before_counts} -> {after_counts}")
if ad_links() != before_links:
    problems.append("liens annonces -> entreprises modifiés")
if conn.execute("PRAGMA foreign_key_check").fetchall():
    problems.append("clés étrangères cassées")

for table, count in after_counts.items():
    print(f"{table}: {count}")

conn.close()

if problems:
    sys.exit("Problème après migration : " + " ; ".join(problems))

print("Migration OK : données, identifiants et liens conservés.")
