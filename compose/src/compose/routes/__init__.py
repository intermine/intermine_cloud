"""Compose routes."""

from blackcap.workers import celery_app
from blackcap.routes.job import job_bp
from blackcap.routes.schedule import schedule_bp
from blackcap.routes.user import user_bp
from blackcap.tasks import init_celery

from compose.routes.data import data_bp
from compose.routes.status import status_bp

from flask import Flask

from logzero import logger


def register_extensions(app: Flask) -> None:
    """Register extension.

    Args:
        app (Flask): Flask app
    """
    init_celery(app, celery_app)
    logger.info("Registered extensions")


def register_blueprints(app: Flask) -> None:
    """Register blueprints.

    Args:
        app (Flask): Flask app
    """
    app.register_blueprint(status_bp)
    app.register_blueprint(job_bp)
    app.register_blueprint(user_bp)
    app.register_blueprint(schedule_bp)
    app.register_blueprint(data_bp)
    logger.info("Registered blueprints")
