import sqlite3
from flask import Blueprint, jsonify, request
from db import get_db

bp = Blueprint("ads", __name__)

def fetch_ad(conn, ad_id):
    return conn.execute(
        """SELECT ads.id, ads.title, ads.short_description, ads.description,
                  ads.salary, ads.location, ads.working_time, ads.contract_type,
                  ads.status, ads.created_at,
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
    # Condition toujours présente : seulement les annonces ouvertes
    conditions = ["ads.status = 'open'"]
    params = []

    # Filtre q : texte dans le titre ou la description courte
    q = request.args.get("q")
    if q:
        conditions.append("(ads.title LIKE ? OR ads.short_description LIKE ?)")
        params.extend([f"%{q}%", f"%{q}%"])

    # Filtre category : nom de catégorie exact
    category = request.args.get("category")
    if category:
        conditions.append("categories.name = ?")
        params.append(category)

    # Filtre contract_type : type de contrat exact
    contract_type = request.args.get("contract_type")
    if contract_type:
        conditions.append("ads.contract_type = ?")
        params.append(contract_type)

    # Filtre location : lieu exact
    location = request.args.get("location")
    if location:
        conditions.append("ads.location = ?")
        params.append(location)

    # Assemblage : nos fragments SQL seulement, jamais une valeur reçue
    sql = (
        """SELECT ads.id, ads.title, ads.short_description,
                  companies.name AS company, ads.location, ads.contract_type,
                  ads.status, ads.created_at
           FROM ads
           JOIN companies ON companies.id = ads.company_id
           JOIN categories ON categories.id = ads.category_id
           WHERE """
        + " AND ".join(conditions)
        + " ORDER BY ads.created_at DESC, ads.id DESC"
    )

    conn = get_db()
    rows = conn.execute(sql, params).fetchall()
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
                  companies.name AS company, ads.location, ads.contract_type,
                  ads.status, ads.created_at
           FROM ads
           JOIN companies ON companies.id = ads.company_id
           WHERE ads.company_id = ? AND ads.status = 'open'
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
    for field in ("first_name", "last_name", "email", "message"):
        value = data.get(field)
        if not isinstance(value, str) or not value.strip():
            return jsonify({"error": f"Missing field: {field}"}), 400

    email = data["email"].strip().lower()

    conn = get_db()

    # 2. L'annonce existe-t-elle ? -> 404
    ad = conn.execute(
        "SELECT id, status FROM ads WHERE id = ?", (ad_id,)
    ).fetchone()
    if ad is None:
        conn.close()
        return jsonify({"error": "Ad not found"}), 404

    # 3. L'annonce est-elle fermée ? -> 409
    if ad["status"] == "closed":
        conn.close()
        return jsonify({"error": "Ad is closed"}), 409

    # 4. Trouver ou créer la personne
    person = conn.execute(
        "SELECT id, password_hash FROM people WHERE email = ?", (email,)
    ).fetchone()

    try:
        if person is None:
            cur = conn.execute(
                "INSERT INTO people (first_name, last_name, email, phone) "
                "VALUES (?, ?, ?, ?)",
                (data["first_name"].strip(), data["last_name"].strip(),
                 email, data.get("phone")),
            )
            person_id = cur.lastrowid
        elif person["password_hash"]:
            conn.close()
            return jsonify({"error": "Login required for this email"}), 401
        else:
            person_id = person["id"]

        # 5. Insérer la candidature
        cur = conn.execute(
            "INSERT INTO applications (ad_id, person_id, message) VALUES (?, ?, ?)",
            (ad_id, person_id, data["message"]),
        )
        conn.commit()
    except sqlite3.IntegrityError:
        conn.rollback()
        conn.close()
        return jsonify({"error": "Already applied"}), 409

    # 6. Relire et renvoyer la candidature -> 201
    row = conn.execute(
        "SELECT id, ad_id, person_id, message, status, created_at "
        "FROM applications WHERE id = ?",
        (cur.lastrowid,),
    ).fetchone()
    conn.close()
    return jsonify(dict(row)), 201

# close_ad
@bp.route("/ads/<int:ad_id>/closure", methods=["POST"])
def close_ad(ad_id):
    data = request.get_json(silent=True) or {}

    conn = get_db()

    # Vérifier que l'annonce existe
    ad = conn.execute(
        "SELECT id, status FROM ads WHERE id = ?",
        (ad_id,)
    ).fetchone()

    if ad is None:
        conn.close()
        return jsonify({"error": "Ad not found"}), 404

    # Vérifier que l'annonce n'est pas déjà fermée
    if ad["status"] == "closed":
        conn.close()
        return jsonify({"error": "Ad already closed"}), 409

    # Vérifier si l'annonce possède des candidatures
    application = conn.execute(
        "SELECT id FROM applications WHERE ad_id = ?",
        (ad_id,)
    ).fetchone()

    # S'il y a des candidatures, accepted_application_id est obligatoire
    if application is not None and data.get("accepted_application_id") in (None, ""):
        conn.close()
        return jsonify({"error": "Missing field: accepted_application_id"}), 400

    # Si l'annonce n'a aucune candidature, on peut simplement la fermer
    if application is not None:
        accepted_application_id = data["accepted_application_id"]

        # Vérifier que la candidature appartient bien à cette annonce
        accepted_application = conn.execute(
            "SELECT id FROM applications WHERE id = ? AND ad_id = ?",
            (accepted_application_id, ad_id)
        ).fetchone()

        if accepted_application is None:
            conn.close()
            return jsonify(
                {"error": "Application does not belong to this ad"}
            ), 400

        # Accepter la candidature choisie
        conn.execute(
            "UPDATE applications SET status = 'accepted' "
            "WHERE id = ?",
            (accepted_application_id,)
        )

        # Refuser toutes les autres candidatures
        conn.execute(
            "UPDATE applications SET status = 'rejected' "
            "WHERE ad_id = ? AND id != ?",
            (ad_id, accepted_application_id)
        )

    # Fermer l'annonce
    conn.execute(
        "UPDATE ads SET status = 'closed' WHERE id = ?",
        (ad_id,)
    )

    # Une seule validation de la transaction
    conn.commit()

    # Récupérer l'annonce dans le même format que GET /api/ads/<id>
    row = fetch_ad(conn, ad_id)

    conn.close()

    return jsonify(dict(row)), 200