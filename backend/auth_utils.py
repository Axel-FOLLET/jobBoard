import os
import sqlite3

from functools import wraps

from dotenv import load_dotenv
from flask import jsonify, session

from db import get_db


def init_security(app):
    load_dotenv()

    secret_key = os.environ.get("SECRET_KEY")

    if not secret_key:
        raise RuntimeError(
            "SECRET_KEY manquante : copie .env.example en .env"
        )

    app.secret_key = secret_key

    app.config.update(
        SESSION_COOKIE_HTTPONLY=True,
        SESSION_COOKIE_SAMESITE="Lax",
        SESSION_COOKIE_SECURE=os.environ.get("COOKIE_SECURE") == "1",
    )

def current_user():
    user_id = session.get("user_id")

    if user_id is None:
        return None

    conn = get_db()

    row = conn.execute(
        """
        SELECT id, first_name, last_name, email, phone, role
        FROM people
        WHERE id = ?
        """,
        (user_id,),
    ).fetchone()

    conn.close()

    if row is None:
        return None

    return dict(row)

def login_required(view):
    @wraps(view)
    def wrapped_view(*args, **kwargs):
        if current_user() is None:
            return jsonify({"error": "Login required"}), 401

        return view(*args, **kwargs)

    return wrapped_view

def admin_required(view):
    @wraps(view)
    def wrapped_view(*args, **kwargs):
        user = current_user()

        if user is None:
            return jsonify({"error": "Login required"}), 401

        if user["role"] != "admin":
            return jsonify({"error": "Admin only"}), 403

        return view(*args, **kwargs)

    return wrapped_view