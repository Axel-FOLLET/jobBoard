import sqlite3
from flask import Blueprint, jsonify, request
from db import get_db

bp = Blueprint("ads", __name__)

def fetch_ad(conn, ad_id):
    return conn.execute(
        """SELECT ads.id, ads.title, ads.short_description, ads.description,
                  ads.salary, ads.location, ads.working_time, ads.contract_type,
                  ads.created_at,
                  companies.name AS company,
                  categories.name AS category,
                  ads.contact_id
           FROM ads
           JOIN companies ON companies.id = ads.company_id
           JOIN categories ON categories.id = ads.category_id
           WHERE ads.id = ?""",
        (ad_id,),
    ).fetchone()

#--------------------list_ads----------------

#C'est un décorateur. Il dit à Flask : « quand quelqu'un envoie une requête GET à l'URL /ads, exécute la fonction juste en dessous.
@bp.route("/ads", methods=["GET"]) 
def list_ads():

#Ouvre la connexion à la base, via ta fonction de db.py
    conn = get_db() 
    rows = conn.execute(

        #companies.name AS company renomme la colonne en company.
        """SELECT ads.id, ads.title, ads.short_description,
                  companies.name AS company, ads.location, ads.contract_type 
           FROM ads
           JOIN companies ON companies.id = ads.company_id
           ORDER BY ads.created_at DESC, ads.id DESC""" 
            #On part des annonces, et pour chacune on va chercher son 
            #entreprise via la clé étrangère company_id et on les tri.


#récupère toutes les lignes du résultat sous forme de liste. 
#Dans rows, tu as donc une liste d'annonces.
    ).fetchall() 
    conn.close()
    return jsonify([dict(r) for r in rows])


#-------------------get ad-------------------------

@bp.route("/ads/<int:ad_id>", methods=["GET"])
def get_ad(ad_id):
    conn = get_db()
    row = fetch_ad(conn, ad_id)
    conn.close()
    if row is None:
        return jsonify({"error": "Ad not found"}), 404
    return jsonify(dict(row))


#-------------------list_company_ads----------------

@bp.route("/companies/<int:company_id>/ads", methods=["GET"])
def list_company_ads(company_id):
    conn = get_db()

    company = conn.execute(
        "SELECT id FROM companies WHERE id = ?", (company_id,)
    ).fetchone()
    if company is None:
        conn.close()
        return jsonify({"error": "Company not found"}), 404

    rows = conn.execute(
        """SELECT ads.id, ads.title, ads.short_description,
                  companies.name AS company, ads.location, ads.contract_type
           FROM ads
           JOIN companies ON companies.id = ads.company_id
           WHERE ads.company_id = ?
           ORDER BY ads.created_at DESC, ads.id DESC""",
        (company_id,),
    ).fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])

#------------------------------ POST/ads --------------------------------

@bp.route("/ads", methods=["POST"])
def create_ad():
    data = request.get_json(silent=True) or {}

    for field in ("title", "short_description", "company_id", "category_id"):
        if data.get(field) in (None, ""):
            return jsonify({"error": f"Missing field: {field}"}), 400

    conn = get_db()
    try:
        cur = conn.execute(
            """INSERT INTO ads (title, short_description, description, salary,
                                location, working_time, contract_type,
                                company_id, category_id, contact_id)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                data["title"],
                data["short_description"],
                data.get("description"),
                data.get("salary"),
                data.get("location"),
                data.get("working_time"),
                data.get("contract_type"),
                data["company_id"],
                data["category_id"],
                data.get("contact_id"),
            ),
        )
        conn.commit()
    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({"error": "Unknown company_id or category_id"}), 400

    row = fetch_ad(conn, cur.lastrowid)
    conn.close()
    return jsonify(dict(row)), 201



#------------------create_application-------------------

@bp.route("/ads/<int:ad_id>/applications", methods=["POST"])
def create_application(ad_id):
    data = request.get_json(silent=True) or {}

    # 1. Champs obligatoires -> 400
    for field in ("person_id", "message"):
        if data.get(field) in (None, ""):
            return jsonify({"error": f"Missing field: {field}"}), 400

    conn = get_db()

    # 2. L'annonce existe-t-elle ? -> 404
    ad = conn.execute("SELECT id FROM ads WHERE id = ?", (ad_id,)).fetchone()
    if ad is None:
        conn.close()
        return jsonify({"error": "Ad not found"}), 404

    # 3. Insertion
    try:
        cur = conn.execute(
            "INSERT INTO applications (ad_id, person_id, message) VALUES (?, ?, ?)",
            (ad_id, data["person_id"], data["message"]),
        )
        conn.commit()
    except sqlite3.IntegrityError as e:
        conn.close()
        if "UNIQUE" in str(e):
            return jsonify({"error": "Already applied"}), 409
        return jsonify({"error": "Unknown person_id"}), 400

    # 4. Relire la candidature créée -> 201
    row = conn.execute(
        "SELECT id, ad_id, person_id, message, created_at FROM applications WHERE id = ?",
        (cur.lastrowid,),
    ).fetchone()
    conn.close()
    return jsonify(dict(row)), 201
