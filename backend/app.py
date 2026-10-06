from flask import Flask, jsonify
from db import get_db

app = Flask(__name__)

@app.route("/ads", methods=["GET"]) #C'est un décorateur. Il dit à Flask : « quand quelqu'un envoie une requête GET à l'URL /ads, exécute la fonction juste en dessous.
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

@app.route("/ads/<int:ad_id>", methods=["GET"])
def get_ad(ad_id):
    conn = get_db()
    row = conn.execute(
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

#.fetchone() au lieu de fetchall() : on veut une seule ligne, ou None si rien ne correspond.
    ).fetchone()
    conn.close()
    if row is None:
        return jsonify({"error": "Ad not found"}), 404
    return jsonify(dict(row))

@app.route("/companies/<int:company_id>/ads", methods=["GET"])
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

if __name__ == "__main__":

    #lance un serveur localhost:5000
    app.run(port=5000, debug=True) 