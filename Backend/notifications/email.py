from flask_mail import Message
from extensions import mail


from notifications.mail_config import mail


class EmailService:

    @staticmethod
    def send_email(recipient, subject, body):

        try:

            msg = Message(
                subject=subject,
                recipients=[recipient]
            )

            msg.body = body

            mail.send(msg)

            return True

        except Exception as e:

            print(e)

            return False