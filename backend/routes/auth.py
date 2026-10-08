import sqlite3
from flask import Blueprint, jsonify, request, session
from werkzeug.security import check_password_hash, generate_password_hash
from auth_utils import current_user

from db import get_db


auth = Blueprint("auth", __name__)


@auth.route("/register", methods=["POST"])
def register():
    data = request.get_json(silent=True) or {}

    for field in ("first_name", "last_name", "email", "password"):
        if data.get(field) in (None, ""):
            return jsonify({"error": f"Missing field: {field}"}), 400

    password = data["password"]

    if len(password) < 8:
        return jsonify({"error": "Password must be at least 8 characters"}), 400

    email = data["email"].strip().lower()
    password_hash = generate_password_hash(password)
    conn = get_db()

    try:
        cur = conn.execute(
            """
            INSERT INTO people
            (first_name, last_name, email, phone, password_hash)
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                data["first_name"],
                data["last_name"],
                email,
                data.get("phone"),
                password_hash,
            ),
        )

        conn.commit()

    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({"error": "Email already used"}), 409

    row = conn.execute(
        """
        SELECT id, first_name, last_name, email, phone, role
        FROM people
        WHERE id = ?
        """,
        (cur.lastrowid,),
    ).fetchone()

    conn.close()

    return jsonify(dict(row)), 201


@auth.route("/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}

    for field in ("email", "password"):
        if data.get(field) in (None, ""):
            return jsonify({"error": f"Missing field: {field}"}), 400

    email = data["email"].strip().lower()
    password = data["password"]

    conn = get_db()

    row = conn.execute(
        """
        SELECT id, first_name, last_name, email, phone, role, password_hash
        FROM people
        WHERE email = ?
        """,
        (email,),
    ).fetchone()

    if (
        row is None
        or not row["password_hash"]
        or not check_password_hash(row["password_hash"], password)
    ):
        conn.close()
        return jsonify({"error": "Invalid credentials"}), 401

    session.clear()
    session["user_id"] = row["id"]

    response = {
        "id": row["id"],
        "first_name": row["first_name"],
        "last_name": row["last_name"],
        "email": row["email"],
        "phone": row["phone"],
        "role": row["role"],
    }

    conn.close()

    return jsonify(response), 200

@auth.route("/logout", methods=["POST"])
def logout():
    session.clear()
    return "", 204

@auth.route("/me", methods=["GET"])
def me():
    user = current_user()

    if user is None:
        return jsonify({"error": "Login required"}), 401

    return jsonify(user), 200

