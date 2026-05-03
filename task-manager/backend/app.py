from flask import Flask, jsonify
from flask_cors import CORS

from config import Config
from controllers.task_controller import tasks_bp
from database import init_database
from extensions import db


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app)
    db.init_app(app)
    app.register_blueprint(tasks_bp)

    init_database(app)

    @app.errorhandler(404)
    def not_found(_error):
        return jsonify({"success": False, "error": "task not found"}), 404

    return app


app = create_app()


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
