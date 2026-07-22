import os
from urllib.parse import quote_plus
from dotenv import load_dotenv

load_dotenv()

class Config:

    DB_PASSWORD = quote_plus(os.getenv("DB_PASSWORD"))

    SQLALCHEMY_DATABASE_URI = (
        f"mysql+pymysql://{os.getenv('DB_USER')}:"
        f"{DB_PASSWORD}@"
        f"{os.getenv('DB_HOST')}:"
        f"{os.getenv('DB_PORT')}/"
        f"{os.getenv('DB_NAME')}"
    )

    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")

    MAIL_SERVER = "smtp.gmail.com"
MAIL_PORT = 587
MAIL_USE_TLS = True
MAIL_USERNAME = "your_email@gmail.com"
MAIL_PASSWORD = "your_app_password"
MAIL_DEFAULT_SENDER = "your_email@gmail.com"