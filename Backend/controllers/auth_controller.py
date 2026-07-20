from flask import request, jsonify
from flask_bcrypt import Bcrypt

from models import db
from models.user import User

bcrypt = Bcrypt()


def register():

    data = request.get_json()

    full_name = data.get("full_name")
    email = data.get("email")
    password = data.get("password")
    role = data.get("role")

    if not all([full_name, email, password, role]):
        return jsonify({
            "message": "All fields are required"
        }), 400

    existing_user = User.query.filter_by(email=email).first()

    if existing_user:
        return jsonify({
            "message": "Email already registered"
        }), 409

    hashed_password = bcrypt.generate_password_hash(password).decode("utf-8")

    new_user = User(
        full_name=full_name,
        email=email,
        password=hashed_password,
        role=role
    )

    db.session.add(new_user)
    db.session.commit()

    return jsonify({
        "message": "User registered successfully"
    }), 201