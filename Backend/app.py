"""
Hospital Management System - Flask Application

Main application entry point for the Hospital Management System backend.
"""

from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt

from config import Config
from extensions import db, bcrypt, jwt, mail
from models import db as models_db

# Route imports
from routes.admin_routes import admin_bp
from routes.doctor_routes import doctor_bp
from routes.patient_routes import patient_bp
from routes.auth_routes import auth_bp
from routes.appointment_routes import appointment_bp
from routes.dashboard_routes import dashboard_bp
from routes.billing_routes import billing_bp
from routes.notification_routes import notification_bp
from routes.prescription_routes import prescription_bp
from routes.ai_routes import ai_bp
from routes.consultation_routes import consultation_bp
from routes.medical_record_routes import medical_record_bp

from scheduler.scheduler import start_scheduler


# Initialize Flask app
app = Flask(__name__)
app.config.from_object(Config)

# Initialize extensions with CORS allowing all origins
CORS(app, resources={r"/api/*": {"origins": "*"}})
jwt = JWTManager(app)
bcrypt = Bcrypt(app)
db.init_app(app)
mail.init_app(app)

# Register blueprints
app.register_blueprint(admin_bp, url_prefix="/api/admin")
app.register_blueprint(doctor_bp, url_prefix="/api/doctor")
app.register_blueprint(patient_bp, url_prefix="/api/patient")
app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(appointment_bp)
app.register_blueprint(dashboard_bp)
app.register_blueprint(billing_bp)
app.register_blueprint(notification_bp)
app.register_blueprint(prescription_bp)
app.register_blueprint(ai_bp)
app.register_blueprint(consultation_bp)
app.register_blueprint(medical_record_bp)

# Create database tables
with app.app_context():
    db.create_all()


@app.route("/")
def home():
    """Health check endpoint."""
    return jsonify({
        "message": "Hospital Management System API Running Successfully",
        "version": "1.0.0"
    })


if __name__ == "__main__":
    start_scheduler()
    app.run(debug=True, host="0.0.0.0", port=5000)
