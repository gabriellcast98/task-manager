import time

from sqlalchemy.exc import OperationalError

from extensions import db
from models.task import Task


def init_database(app):
    with app.app_context():
        for _ in range(20):
            try:
                db.create_all()
                ensure_schema()
                break
            except OperationalError:
                time.sleep(1)


def ensure_schema():
    with db.engine.connect() as connection:
        connection.exec_driver_sql(
            """
            ALTER TABLE tasks
            ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP
            """
        )
        connection.exec_driver_sql(
            """
            UPDATE tasks
            SET updated_at = created_at
            WHERE updated_at IS NULL
            """
        )
        connection.exec_driver_sql(
            """
            ALTER TABLE tasks
            ALTER COLUMN updated_at SET NOT NULL
            """
        )
        connection.commit()
