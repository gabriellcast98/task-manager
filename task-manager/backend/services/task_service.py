from datetime import datetime

from extensions import db
from models.task import Task


VALID_STATUSES = {"pending", "in_progress", "done"}


def list_tasks():
    return Task.query.order_by(Task.created_at.desc()).all()


def get_task(task_id):
    return Task.query.get_or_404(task_id)


def create_task(data):
    title = (data.get("title") or "").strip()
    description = (data.get("description") or "").strip()
    status = data.get("status", "pending")

    validate_title(title)
    validate_status(status)

    task = Task(title=title, description=description, status=status)
    db.session.add(task)
    db.session.commit()

    return task


def update_task(task_id, data):
    task = get_task(task_id)

    if "title" in data:
        title = (data.get("title") or "").strip()
        validate_title(title)
        task.title = title

    if "description" in data:
        task.description = (data.get("description") or "").strip()

    if "status" in data:
        validate_status(data["status"])
        task.status = data["status"]

    task.updated_at = datetime.utcnow()
    db.session.commit()

    return task


def delete_task(task_id):
    task = get_task(task_id)
    db.session.delete(task)
    db.session.commit()

    return task_id


def validate_title(title):
    if not title:
        raise ValueError("title is required")


def validate_status(status):
    if status not in VALID_STATUSES:
        raise ValueError("invalid status")
