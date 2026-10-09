import sqlite3
from flask import Blueprint, jsonify, request, session
from werkzeug.security import check_password_hash, generate_password_hash
from auth_utils import current_user, get_json_object, validate_text_field

from db import get_db


auth = Blueprint("auth", __name__)


@auth.route("/register", methods=["POST"])
def register():
    data, error = get_json_object()

    if error:
        return error

    for field in ("first_name", "last_name", "email", "password"):
        error = validate_text_field(data, field, email=(field == "email"))

        if error:
            return error


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
    data, error = get_json_object()

    if error:
        return error

    for field in ("email", "password"):
        error = validate_text_field(data, field, email=(field == "email"))

        if error:
            return error

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


@auth.route("/me", methods=["GET", "PATCH"])
def me():
    user = current_user()

    if user is None:
        return jsonify({"error": "Login required"}), 401

    if request.method == "GET":
        return jsonify(user), 200

    data, error = get_json_object()

    if error:
        return error

    if not data:
        return jsonify({"error": "No field to update"}), 400

    allowed_fields = {"first_name", "last_name", "phone", "email"}

    for field in data:
        if field not in allowed_fields:
            return jsonify({"error": f"Unknown field: {field}"}), 400

    for field in data:
        if field == "phone" and data[field] == "":
            continue

        error = validate_text_field(
            data,
            field,
            email=(field == "email"),
        )

        if error:
            return error

    if "email" in data:
        data["email"] = data["email"].strip().lower()

    conn = get_db()

    if "email" in data:
        existing_user = conn.execute(
            """
            SELECT id
            FROM people
            WHERE email = ? AND id != ?
            """,
            (data["email"], user["id"]),
        ).fetchone()

        if existing_user is not None:
            conn.close()
            return jsonify({"error": "Email already used"}), 409

    fields = list(data.keys())
    values = []

    for field in fields:
        value = data[field]

        if isinstance(value, str):
            value = value.strip()

        values.append(value)

    assignments = ", ".join(f"{field} = ?" for field in fields)
    values.append(user["id"])

    conn.execute(
        f"UPDATE people SET {assignments} WHERE id = ?",
        values,
    )
    conn.commit()

    row = conn.execute(
        """
        SELECT id, first_name, last_name, email, phone, role
        FROM people
        WHERE id = ?
        """,
        (user["id"],),
    ).fetchone()

    conn.close()

    return jsonify(dict(row)), 200
