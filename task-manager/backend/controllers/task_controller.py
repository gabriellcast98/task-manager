from flask import Blueprint, jsonify, request

from services import task_service


tasks_bp = Blueprint("tasks", __name__)


@tasks_bp.get("/tasks")
def list_tasks():
    tasks = task_service.list_tasks()
    return jsonify({"success": True, "data": [task.to_dict() for task in tasks]})


@tasks_bp.get("/tasks/<int:task_id>")
def get_task(task_id):
    task = task_service.get_task(task_id)
    return jsonify({"success": True, "data": task.to_dict()})


@tasks_bp.post("/tasks")
def create_task():
    data = request.get_json(silent=True) or {}

    try:
        task = task_service.create_task(data)
    except ValueError as error:
        return jsonify({"success": False, "error": str(error)}), 400

    return jsonify({"success": True, "data": task.to_dict()}), 201


@tasks_bp.put("/tasks/<int:task_id>")
def update_task(task_id):
    data = request.get_json(silent=True) or {}

    try:
        task = task_service.update_task(task_id, data)
    except ValueError as error:
        return jsonify({"success": False, "error": str(error)}), 400

    return jsonify({"success": True, "data": task.to_dict()})


@tasks_bp.delete("/tasks/<int:task_id>")
def delete_task(task_id):
    deleted_id = task_service.delete_task(task_id)
    return jsonify({"success": True, "data": {"id": deleted_id}})
