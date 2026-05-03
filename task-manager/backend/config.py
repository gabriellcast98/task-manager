import os


class Config:
    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL",
        "postgresql+psycopg2://task_user:task_password@localhost:5432/task_db",
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False


