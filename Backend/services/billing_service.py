import random
from models import db
from models.bill import Bill
from models.appointment import Appointment


class BillingService:

    @staticmethod
    def generate_invoice_number():
        """
        Generates invoice numbers like:
        INV-482931
        """
        return f"INV-{random.randint(100000,999999)}"

    @staticmethod
    def create_bill(data):

        appointment = Appointment.query.get(data["appointment_id"])

        if not appointment:
            return None, "Appointment not found"

        existing_bill = Bill.query.filter_by(
            appointment_id=data["appointment_id"]
        ).first()

        if existing_bill:
            return None, "Bill already exists for this appointment"

        consultation_fee = float(data.get("consultation_fee", 0))
        medicine_charge = float(data.get("medicine_charge", 0))
        lab_charge = float(data.get("lab_charge", 0))
        other_charge = float(data.get("other_charge", 0))

        total = (
            consultation_fee +
            medicine_charge +
            lab_charge +
            other_charge
        )

        bill = Bill(
            invoice_number=BillingService.generate_invoice_number(),
            appointment_id=data["appointment_id"],
            consultation_fee=consultation_fee,
            medicine_charge=medicine_charge,
            lab_charge=lab_charge,
            other_charge=other_charge,
            total_amount=total
        )

        db.session.add(bill)
        db.session.commit()

        return bill, None

    @staticmethod
    def get_all_bills():

        bills = Bill.query.order_by(
            Bill.created_at.desc()
        ).all()

        return [bill.to_dict() for bill in bills]

    @staticmethod
    def get_bill_by_id(bill_id):

        bill = Bill.query.get(bill_id)

        if not bill:
            return None

        return bill.to_dict()

    @staticmethod
    def update_bill(bill_id, data):

        bill = Bill.query.get(bill_id)

        if not bill:
            return None, "Bill not found"

        bill.consultation_fee = float(
            data.get("consultation_fee", bill.consultation_fee)
        )

        bill.medicine_charge = float(
            data.get("medicine_charge", bill.medicine_charge)
        )

        bill.lab_charge = float(
            data.get("lab_charge", bill.lab_charge)
        )

        bill.other_charge = float(
            data.get("other_charge", bill.other_charge)
        )

        bill.total_amount = (
            bill.consultation_fee +
            bill.medicine_charge +
            bill.lab_charge +
            bill.other_charge
        )

        db.session.commit()

        return bill, None

    @staticmethod
    def delete_bill(bill_id):

        bill = Bill.query.get(bill_id)

        if not bill:
            return False

        db.session.delete(bill)
        db.session.commit()

        return True

    from datetime import datetime


    @staticmethod
    def mark_bill_as_paid(bill_id, payment_method):

        bill = Bill.query.get(bill_id)

        if not bill:
            return None, "Bill not found"

        if bill.payment_status == "Paid":
            return None, "Bill is already paid"

        bill.payment_status = "Paid"
        bill.payment_method = payment_method
        bill.payment_date = datetime.utcnow()

        db.session.commit()

        return bill, None


    @staticmethod
    def get_total_revenue():

        bills = Bill.query.filter_by(
            payment_status="Paid"
        ).all()

        total = sum(bill.total_amount for bill in bills)

        return {
            "total_revenue": total
        }


    @staticmethod
    def get_pending_revenue():

        bills = Bill.query.filter_by(
            payment_status="Pending"
        ).all()

        total = sum(bill.total_amount for bill in bills)

        return {
            "pending_revenue": total
        }


    @staticmethod
    def get_paid_bill_count():

        count = Bill.query.filter_by(
            payment_status="Paid"
        ).count()

        return count


    @staticmethod
    def get_pending_bill_count():

        count = Bill.query.filter_by(
            payment_status="Pending"
        ).count()

        return count


    @staticmethod
    def get_dashboard_statistics():

        total_bills = Bill.query.count()

        paid_bills = Bill.query.filter_by(
            payment_status="Paid"
        ).count()

        pending_bills = Bill.query.filter_by(
            payment_status="Pending"
        ).count()

        total_revenue = sum(
            bill.total_amount
            for bill in Bill.query.filter_by(payment_status="Paid").all()
        )

        pending_revenue = sum(
            bill.total_amount
            for bill in Bill.query.filter_by(payment_status="Pending").all()
        )

        return {

            "total_bills": total_bills,

            "paid_bills": paid_bills,

            "pending_bills": pending_bills,

            "total_revenue": total_revenue,

            "pending_revenue": pending_revenue

        }