from functools import wraps
from flask import jsonify
from flask_jwt_extended import get_jwt, jwt_required


def role_required(required_roles):
    def decorator(fn):

        @wraps(fn)
        @jwt_required()
        def wrapper(*args, **kwargs):

            claims = get_jwt()
            user_role = claims.get("role")
            
            if isinstance(required_roles, str):
                roles_to_check = [required_roles]
            else:
                roles_to_check = required_roles

            if user_role not in roles_to_check:
                return jsonify({
                    "message": "Access Denied"
                }), 403

            return fn(*args, **kwargs)

        return wrapper

    return decorator