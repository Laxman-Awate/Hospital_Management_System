from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt
from routes.admin_routes import admin_bp
from routes.doctor_routes import doctor_bp
from routes.patient_routes import patient_bp

from config import Config
from models import db
from routes.auth_routes import auth_bp

app = Flask(__name__)

app.config.from_object(Config)

app.register_blueprint(admin_bp, url_prefix="/api/admin")
app.register_blueprint(doctor_bp, url_prefix="/api/doctor")
app.register_blueprint(patient_bp, url_prefix="/api/patient")

CORS(app)

jwt = JWTManager(app)

bcrypt = Bcrypt(app)

db.init_app(app)

with app.app_context():
    db.create_all()

app.register_blueprint(auth_bp, url_prefix="/api/auth")


@app.route("/")
def home():
    return {
        "message": "Hospital Management System API Running Successfully"
    }


if __name__ == "__main__":
    app.run(debug=True)