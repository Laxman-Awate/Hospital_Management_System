from flask import jsonify, request
import services.doctor_service as doctor_service

from utils.response import success_response, error_response
from utils.role_required import role_required


class DoctorController:

    @staticmethod
    @role_required("Doctor")
    def doctor_dashboard():
        return jsonify({
            "message": "Welcome Doctor"
        }), 200

    @staticmethod
    @role_required("Admin")
    def create_doctor():
        data = request.get_json()

        required_fields = [
            "full_name",
            "email",
            "password",
            "specialization"
        ]

        for field in required_fields:
            if not data.get(field):
                return error_response(f"{field} is required", 400)

        doctor, error = doctor_service.create_doctor(data)

        if error:
            return error_response(error, 400)

        doctor_data = {
            "id": doctor.id,
            "user_id": doctor.user_id,
            "full_name": doctor.user.full_name,
            "email": doctor.user.email,
            "specialization": doctor.specialization,
            "qualification": doctor.qualification,
            "experience": doctor.experience,
            "consultation_fee": doctor.consultation_fee,
            "department": doctor.department,
            "phone": doctor.phone,
            "available_days": doctor.available_days,
            "available_time": doctor.available_time,
            "status": doctor.status
        }

        return success_response(
            "Doctor created successfully",
            doctor_data,
            201
        )

    @staticmethod
    def get_doctors():
        doctors = doctor_service.get_doctors()

        return success_response(
            "Doctors fetched successfully",
            doctors
        )

    @staticmethod
    @role_required("Admin")
    def get_doctor(doctor_id):
        doctor = doctor_service.get_doctor_by_id(doctor_id)

        if not doctor:
            return error_response("Doctor not found", 404)

        return success_response(
            "Doctor fetched successfully",
            doctor
        )

    @staticmethod
    @role_required("Admin")
    def update_doctor(doctor_id):
        data = request.get_json()

        doctor, error = doctor_service.update_doctor(
            doctor_id,
            data
        )

        if error:
            return error_response(error, 404)

        doctor_data = {
            "id": doctor.id,
            "user_id": doctor.user_id,
            "full_name": doctor.user.full_name,
            "email": doctor.user.email,
            "specialization": doctor.specialization,
            "qualification": doctor.qualification,
            "experience": doctor.experience,
            "consultation_fee": doctor.consultation_fee,
            "department": doctor.department,
            "phone": doctor.phone,
            "available_days": doctor.available_days,
            "available_time": doctor.available_time,
            "status": doctor.status
        }

        return success_response(
            "Doctor updated successfully",
            doctor_data
        )

    @staticmethod
    @role_required("Admin")
    def delete_doctor(doctor_id):
        error = doctor_service.delete_doctor(doctor_id)

        if error:
            return error_response(error, 404)

        return success_response(
            "Doctor deleted successfully"
        )