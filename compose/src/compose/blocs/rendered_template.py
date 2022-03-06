"""RenderedTemplate BLoCs."""

from typing import List, Optional

from blackcap.db import DBSession
from blackcap.schemas.user import User
from logzero import logger
from pydantic import ValidationError
from pydantic.error_wrappers import ErrorWrapper
from sqlalchemy import select

from compose.models.rendered_templates import RenderedTemplateDB
from compose.schemas.api.rendered_template.delete import RenderedTemplateDelete
from compose.schemas.api.rendered_template.get import (
    RenderedTemplateGetQueryParams,
    RenderedTemplateQueryType,
)
from compose.schemas.api.rendered_template.post import RenderedTemplateCreate
from compose.schemas.api.rendered_template.put import RenderedTemplateUpdate
from compose.schemas.template import RenderedTemplate

###
# CRUD BLoCs
###


def create_rendered_template(
    rendered_template_list: List[RenderedTemplateCreate], user_creds: User
) -> List[RenderedTemplate]:
    """Create rendered template objects.

    Args:
        rendered_template_list (List[RenderedTemplateCreate]): List of rendered template objects to create.
        user_creds (User): User credentials.

    Raises:
        Exception: database error

    Returns:
        List[RenderedTemplate]: Created rendered template objects
    """
    with DBSession() as session:
        try:
            rendered_template_db_create_list: List[RenderedTemplateDB] = [
                RenderedTemplateDB(
                    protagonist_id=user_creds.user_id,
                    **rendered_template.dict(),
                )
                for rendered_template in rendered_template_list
            ]
            RenderedTemplateDB.bulk_create(rendered_template_db_create_list, session)
            return [
                RenderedTemplate(rendered_template_id=obj.id, **obj.to_dict())
                for obj in rendered_template_db_create_list
            ]
        except Exception as e:
            session.rollback()
            logger.error(f"Unable to create renderded templates: {e}")
            raise e


def get_rendered_template(
    query_params: RenderedTemplateGetQueryParams, user_creds: User
) -> List[RenderedTemplate]:
    """Query DB for RenderedTemplates.

    Args:
        query_params (RenderedTemplateGetQueryParams): Query params from request
        user_creds (User): User credentials.

    Raises:
        Exception: error

    Returns:
        List[RenderedTemplate]: List of RenderedTemplates returned from DB
    """
    stmt = ""

    if query_params.query_type == RenderedTemplateQueryType.GET_ALL_RENDERED_TEMPLATES:
        stmt = select(RenderedTemplateDB).where(
            RenderedTemplateDB.protagonist_id == user_creds.user_id
        )
    if query_params.query_type == RenderedTemplateQueryType.GET_RENDERED_TEMPLATE_BY_ID:
        if query_params.template_id is None:
            e = ValidationError(
                errors=[
                    ErrorWrapper(ValueError("field required"), "template_id"),
                ],
                model=RenderedTemplateGetQueryParams,
            )
            raise e
        stmt = (
            select(RenderedTemplateDB)
            .where(RenderedTemplateDB.protagonist_id == user_creds.user_id)
            .where(RenderedTemplateDB.id == query_params.template_id)
        )
    if (
        query_params.query_type
        == RenderedTemplateQueryType.GET_RENDERED_TEMPLATES_BY_PROTAGONIST_ID
    ):
        if query_params.protagonist_id is None:
            e = ValidationError(
                errors=[
                    ErrorWrapper(ValueError("field required"), "protagonist_id"),
                ],
                model=RenderedTemplateGetQueryParams,
            )
            raise e
        stmt = select(RenderedTemplateDB).where(
            RenderedTemplateDB.id == user_creds.user_id
        )

    with DBSession() as session:
        try:
            rendered_template_list: List[RenderedTemplateDB] = (
                session.execute(stmt).scalars().all()
            )
            return [
                RenderedTemplate(renderedtemplate_id=obj.id, **obj.to_dict())
                for obj in rendered_template_list
            ]
        except Exception as e:
            session.rollback()
            logger.error(f"Unable to fetch rendered_templates due to {e}")
            raise e


def update_rendered_template(
    rendered_template_update_list: List[RenderedTemplateUpdate], user_creds: User
) -> List[RenderedTemplate]:
    """Update RenderedTemplate in the DB from RenderedTemplateUpdate request.

    Args:
        rendered_template_update_list (List[RenderedTemplateUpdate]): List of RenderedTemplateUpdate request
        user_creds (User): User credentials.

    Raises:
        Exception: error

    Returns:
        List[RenderedTemplate]: List of Instance of Updated RenderedTemplate
    """
    stmt = (
        select(RenderedTemplateDB)
        .where(RenderedTemplateDB.protagonist_id == user_creds.user_id)
        .where(
            RenderedTemplateDB.id.in_(
                [
                    rendered_template_update.rendered_template_id
                    for rendered_template_update in rendered_template_update_list
                ]
            )
        )
    )
    with DBSession() as session:
        try:
            rendered_template_db_update_list: List[RenderedTemplateDB] = (
                session.execute(stmt).scalars().all()
            )
            updated_rendered_template_list = []
            for rendered_template in rendered_template_db_update_list:
                for rendered_template_update in rendered_template_update_list:
                    if (
                        rendered_template_update.rendered_template_id
                        == rendered_template.id
                    ):
                        rendered_template_update_dict = rendered_template_update.dict(
                            exclude_defaults=True
                        )
                        rendered_template_update_dict.pop("rendered_template_id")
                        updated_rendered_template = rendered_template.update(
                            session, **rendered_template_update_dict
                        )
                        updated_rendered_template_list.append(
                            RenderedTemplate(
                                rendered_template_id=updated_rendered_template.id,
                                **updated_rendered_template.to_dict(),
                            )
                        )
            return updated_rendered_template_list
        except Exception as e:
            session.rollback()
            logger.error(
                f"Unable to update rendered_template: {rendered_template.to_dict()} due to {e}"
            )
            raise e


def delete_rendered_template(
    rendered_template_delete_list: List[RenderedTemplateDelete], user_creds: User
) -> List[RenderedTemplate]:
    """Delete rendered template in the DB from RenderedTemplateDelete request.

    Args:
        rendered_template_delete_list (List[RenderedTemplateDelete]): List of RenderedTemplateDelete request
        user_creds (User): User credentials.

    Raises:
        Exception: error

    Returns:
        List[RenderedTemplate]: List of Instance of Deleted RenderedTemplate
    """
    stmt = (
        select(RenderedTemplateDB)
        .where(RenderedTemplateDB.protagonist_id == user_creds.user_id)
        .where(
            RenderedTemplateDB.id.in_(
                [
                    rendered_template.rendered_template_id
                    for rendered_template in rendered_template_delete_list
                ]
            )
        )
    )
    with DBSession() as session:
        try:
            rendered_template_db_delete_list: List[RenderedTemplateDB] = (
                session.execute(stmt).scalars().all()
            )
            deleted_rendered_template_list = []
            for rendered_template in rendered_template_db_delete_list:
                rendered_template.delete(session)
                deleted_rendered_template_list.append(
                    RenderedTemplate(
                        rendered_template_id=rendered_template.id,
                        **rendered_template.to_dict(),
                    )
                )
            return deleted_rendered_template_list
        except Exception as e:
            session.rollback()
            logger.error(
                f"Unable to delete rendered_template: {rendered_template.to_dict()} due to {e}"
            )
            raise e


###
# Flow BLoCs
###
