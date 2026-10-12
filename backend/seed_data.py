import json
import sys

from db import get_db

DATA_FILE = "data/annonces.json"
TABLES = ("companies", "categories", "people", "ads", "applications")

# Lire le fichier de données (4 listes : companies, categories, contacts, ads)
with open(DATA_FILE, encoding="utf-8") as f:
    data = json.load(f)

conn = get_db()

# --------------------------------------------------
# 0. Deuxième lancement : on s'arrête sans rien insérer
# --------------------------------------------------
names = [company["name"] for company in data["companies"]]
placeholders = ", ".join("?" for _ in names)  # "?, ?, ?, ..." (un ? par nom)

already = conn.execute(
    f"SELECT COUNT(*) FROM companies WHERE name IN ({placeholders})",
    names,
).fetchone()[0]

if already > 0:
    conn.close()
    sys.exit(
        f"Base déjà remplie : {already} entreprise(s) du fichier existe(nt) déjà. "
        "Relance python init_db.py avant python seed_data.py."
    )

# --------------------------------------------------
# 1. Entreprises : insérer et garder nom -> id
# --------------------------------------------------
company_ids = {}

for company in data["companies"]:
    cur = conn.execute(
        """INSERT INTO companies (name, description, location, website)
           VALUES (?, ?, ?, ?)""",
        (
            company["name"],
            company.get("description"),
            company.get("location"),
            company.get("website"),
        ),
    )
    # lastrowid : l'id que la base vient d'attribuer à cette entreprise
    company_ids[company["name"]] = cur.lastrowid

# --------------------------------------------------
# 2. Catégories : chercher d'abord (name est UNIQUE), insérer si absente
# --------------------------------------------------
category_ids = {}

for category in data["categories"]:
    row = conn.execute(
        "SELECT id FROM categories WHERE name = ?",
        (category["name"],),
    ).fetchone()

    if row is not None:
        # déjà dans seed.sql (Développement, Design, Data) : on reprend son id
        category_ids[category["name"]] = row["id"]
    else:
        cur = conn.execute(
            "INSERT INTO categories (name) VALUES (?)",
            (category["name"],),
        )
        category_ids[category["name"]] = cur.lastrowid

# --------------------------------------------------
# 3. Recruteurs : insérer dans people et garder email -> id
#    (pas de password_hash, role vaut 'user' par défaut)
# --------------------------------------------------
contact_ids = {}

for contact in data["contacts"]:
    email = contact["email"].strip().lower()  # même normalisation que l'inscription

    cur = conn.execute(
        """INSERT INTO people (first_name, last_name, email, phone)
           VALUES (?, ?, ?, ?)""",
        (
            contact["first_name"],
            contact["last_name"],
            email,
            contact.get("phone"),
        ),
    )
    contact_ids[email] = cur.lastrowid

# --------------------------------------------------
# 4. Annonces : retrouver les 3 id à partir des noms et de l'email
#    (ni status ni created_at : la base met 'open' et la date du moment)
# --------------------------------------------------
for ad in data["ads"]:
    company_id = company_ids[ad["company"]]
    category_id = category_ids[ad["category"]]
    contact_id = contact_ids[ad["contact_email"].strip().lower()]

    # salary : converti en entier (la colonne est un INTEGER)
    salary = ad.get("salary")
    if salary is not None:
        salary = int(salary)

    conn.execute(
        """INSERT INTO ads (title, short_description, description, salary,
                            location, working_time, contract_type,
                            company_id, category_id, contact_id)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (
            ad["title"],
            ad["short_description"],
            ad.get("description"),
            salary,
            ad.get("location"),
            ad.get("working_time"),
            ad.get("contract_type"),
            company_id,
            category_id,
            contact_id,
        ),
    )

# --------------------------------------------------
# 5. Un seul commit : tout est enregistré, ou rien si le script s'arrête avant
# --------------------------------------------------
conn.commit()

for table in TABLES:
    count = conn.execute(f"SELECT COUNT(*) FROM {table}").fetchone()[0]
    print(f"{table}: {count}")

conn.close()
