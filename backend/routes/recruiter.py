from functools import wraps
from flask import Blueprint, jsonify
from auth_utils import current_user
from db import get_db

recruiter = Blueprint("recruiter", __name__)


# Vérifier que la personne connectée est recruteur.
# Le company_id vient toujours de la fiche de la personne connectée, jamais du client :
# il est transmis à la route en argument (def ma_route(company_id): ...).
def recruiter_required(view):
    @wraps(view)
    def wrapped_view(*args, **kwargs):
        user = current_user()

        # 1. pas de session -> 401 Login required
        if user is None:
            return jsonify({"error": "Login required"}), 401

        # current_user() ne renvoie pas company_id : on le lit dans la base
        conn = get_db()
        row = conn.execute(
            "SELECT company_id FROM people WHERE id = ?",
            (user["id"],),
        ).fetchone()
        conn.close()

        # 2. pas de company_id -> 403 Recruiter only (même pour un admin)
        if row is None or row["company_id"] is None:
            return jsonify({"error": "Recruiter only"}), 403

        # 3. sinon : appeler la vraie route, avec l'entreprise du recruteur
        return view(*args, company_id=row["company_id"], **kwargs)

    return wrapped_view
