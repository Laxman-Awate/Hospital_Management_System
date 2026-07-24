"""Migrate legacy patient-scoped notifications to the user-scoped schema.

Run once from the Backend directory:
    .\venv\Scripts\python.exe migrations\migrate_notifications_user_scope.py
"""

from pathlib import Path
import sys

from flask import Flask
from sqlalchemy import inspect, text

# Allow this script to be executed directly from Backend/migrations.
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from config import Config  # noqa: E402
from extensions import db  # noqa: E402


def migrate():
    app = Flask(__name__)
    app.config.from_object(Config)
    db.init_app(app)

    with app.app_context():
        inspector = inspect(db.engine)
        if "notifications" not in inspector.get_table_names():
            print("notifications table does not exist; no migration is required.")
            return

        columns = {column["name"] for column in inspector.get_columns("notifications")}
        with db.engine.begin() as connection:
            if "user_id" not in columns:
                connection.execute(text("ALTER TABLE notifications ADD COLUMN user_id INT NULL"))
                print("Added notifications.user_id")
            if "type" not in columns:
                connection.execute(text("ALTER TABLE notifications ADD COLUMN `type` VARCHAR(50) NULL"))
                print("Added notifications.type")
            if "is_read" not in columns:
                connection.execute(text("ALTER TABLE notifications ADD COLUMN is_read BOOLEAN NOT NULL DEFAULT FALSE"))
                print("Added notifications.is_read")

            current_columns = {column["name"] for column in inspect(db.engine).get_columns("notifications")}
            if "patient_id" in current_columns:
                connection.execute(text(
                    "UPDATE notifications n "
                    "JOIN patients p ON p.id = n.patient_id "
                    "SET n.user_id = p.user_id "
                    "WHERE n.user_id IS NULL"
                ))
            if "notification_type" in current_columns:
                connection.execute(text(
                    "UPDATE notifications SET `type` = notification_type "
                    "WHERE `type` IS NULL OR `type` = ''"
                ))
            connection.execute(text(
                "UPDATE notifications SET `type` = 'General Notification' "
                "WHERE `type` IS NULL OR `type` = ''"
            ))

        inspector = inspect(db.engine)
        foreign_keys = inspector.get_foreign_keys("notifications")
        has_user_fk = any(foreign_key.get("referred_table") == "users" and "user_id" in foreign_key.get("constrained_columns", []) for foreign_key in foreign_keys)
        if not has_user_fk:
            with db.engine.begin() as connection:
                connection.execute(text(
                    "ALTER TABLE notifications ADD CONSTRAINT fk_notifications_user_id "
                    "FOREIGN KEY (user_id) REFERENCES users (id)"
                ))
            print("Added notifications.user_id foreign key")

        print("Notification user-scope migration completed successfully.")


if __name__ == "__main__":
    migrate()
