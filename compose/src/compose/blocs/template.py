"""Template BLoCs."""

from typing import List, Optional

from blackcap.db import DBSession
from blackcap.schemas.user import User

from compose.models.template import TemplateDB
from compose.schemas.api.template.get import TemplateGetQueryParams, TemplateQueryType
from compose.schemas.api.template.put import TemplateUpdate
from compose.schemas.api.template.delete import TemplateDelete
from compose.schemas.template import Template

from logzero import logger

from sqlalchemy import select


def create_template(
    template_list: List[Template], user_creds: Optional[User] = None
) -> List[Template]:
    """Create template objects.

    Args:
        template_list (List[Template]): List of template objects to create.
        user_creds (Optional[User], optional): User credentials. Defaults to None.

    Returns:
        List[Template]: Created template objects
    """
    with DBSession() as session:
        try:
            template_db_create_list: List[TemplateDB] = [
                TemplateDB(
                    protagonist_id=user_creds.user_id,
                    **template.dict(exclude={"template_id"}),  # noqa: E501
                )
                for template in template_list
            ]
            TemplateDB.bulk_create(template_db_create_list, session)
            return [
                Template(template_id=obj.id, **obj.to_dict())
                for obj in template_db_create_list  # noqa: E501
            ]
        except Exception as e:
            session.rollback()
            logger.error(f"Unable to create templates: {e}")
            raise e


def get_template(
    query_params: TemplateGetQueryParams, user_creds: Optional[User] = None
) -> List[Template]:
    """Query DB for Templates.

    Args:
        query_params (TemplateGetQueryParams): Query params from request

    Raises:
        Exception: error

    Returns:
        List[Template]: List of Templates returned from DB
    """
    template_list: List[TemplateDB] = []

    stmt = ""

    if query_params.query_type == TemplateQueryType.GET_ALL_TEMPLATES:
        stmt = select(TemplateDB)
    if query_params.query_type == TemplateQueryType.GET_TEMPLATE_BY_ID:
        stmt = select(TemplateDB).where(TemplateDB.id == query_params.template_id)
    if query_params.query_type == TemplateQueryType.GET_TEMPLATES_BY_PROTAGONIST_ID:
        stmt = select(TemplateDB).where(TemplateDB.id == query_params.protagonist_id)

    with DBSession() as session:
        try:
            template_list: List[TemplateDB] = (
                session.execute(stmt).scalars().all()
            )  # noqa: E501
            return [
                Template(template_id=obj.id, **obj.to_dict()) for obj in template_list
            ]
        except Exception as e:
            session.rollback()
            logger.error(f"Unable to fetch templates due to {e}")
            raise e

    return template_list


def update_template(
    template_update: TemplateUpdate, user_creds: Optional[User] = None
) -> Template:
    """Update Template in the DB from TemplateUpdate request.

    Args:
        template_update (TemplateUpdate): TemplateUpdate request

    Raises:
        Exception: error

    Returns:
        Template: Instance of Updated Template
    """
    stmt = select(TemplateDB).where(TemplateDB.id == template_update.template_id)
    with DBSession() as session:
        try:
            template_list: List[TemplateDB] = (
                session.execute(stmt).scalars().all()
            )  # noqa: E501
            if len(template_list) == 1:
                template_update_dict = template_update.dict(exclude_defaults=True)
                template_update_dict.pop("template_id")
                updated_template = template_list[0].update(
                    session, **template_update_dict
                )  # noqa: E501
                return Template(
                    template_id=updated_template.id, **updated_template.to_dict()
                )
            if len(template_list) == 0:
                # TODO: Raise not found
                pass
        except Exception as e:
            session.rollback()
            logger.error(
                f"Unable to update template: {template_update.dict()} due to {e}"
            )  # noqa: E501
            raise e


def delete_template(
    template_delete: TemplateDelete, user_creds: Optional[User] = None
) -> Template:
    """Delete template in the DB from TemplateDelete request.

    Args:
        template_delete (TemplateDelete): TemplateDelete request

    Raises:
        Exception: error

    Returns:
        Template: Instance of Deleted Template
    """
    stmt = select(TemplateDB).where(TemplateDB.id == template_delete.template_id)
    with DBSession() as session:
        try:
            template_list: List[TemplateDB] = (
                session.execute(stmt).scalars().all()
            )  # noqa: E501
            if len(template_list) == 1:
                deleted_template = template_list[0].delete(session)
                return Template(
                    template_id=deleted_template.id, **deleted_template.to_dict()
                )
            if len(template_list) == 0:
                # TODO: Raise not found
                pass
        except Exception as e:
            session.rollback()
            logger.error(
                f"Unable to delete template: {template_delete.dict()} due to {e}"
            )  # noqa: E501
            raise e
