"""RenderedTemplate BLoCs."""

from typing import List, Optional

from blackcap.db import DBSession
from blackcap.schemas.user import User

from compose.models.rendered_templates import RenderedTemplateDB
from compose.schemas.api.rendered_template.get import (
    RenderedTemplateGetQueryParams,
    RenderedTemplateQueryType,
)
from compose.schemas.api.rendered_template.put import RenderedTemplateUpdate
from compose.schemas.api.rendered_template.delete import RenderedTemplateDelete
from compose.schemas.template import RenderedTemplate

from logzero import logger

from sqlalchemy import select


def create_rendered_template(
    rendered_template_list: List[RenderedTemplate], user_creds: Optional[User] = None
) -> List[RenderedTemplate]:
    """Create rendered template objects.

    Args:
        rendered_template_list (List[RenderedTemplate]): List of rendered template objects to create.
        user_creds (Optional[User], optional): User credentials. Defaults to None.

    Returns:
        List[RenderedTemplate]: Created rendered template objects
    """
    with DBSession() as session:
        try:
            rendered_template_db_create_list: List[RenderedTemplateDB] = [
                RenderedTemplateDB(
                    protagonist_id=user_creds.user_id,
                    **rendered_template.dict(
                        exclude={"rendered_template_id"}
                    ),  # noqa: E501
                )
                for rendered_template in rendered_template_list
            ]
            RenderedTemplateDB.bulk_create(rendered_template_db_create_list, session)
            return [
                RenderedTemplate(template_id=obj.id, **obj.to_dict())
                for obj in rendered_template_db_create_list  # noqa: E501
            ]
        except Exception as e:
            session.rollback()
            logger.error(f"Unable to create renderded templates: {e}")
            raise e


def get_rendered_template(
    query_params: RenderedTemplateGetQueryParams,
) -> List[RenderedTemplate]:
    """Query DB for RenderedTemplates.

    Args:
        query_params (RenderedTemplateGetQueryParams): Query params from request

    Raises:
        Exception: error

    Returns:
        List[RenderedTemplate]: List of RenderedTemplates returned from DB
    """

    stmt = ""

    if query_params.query_type == RenderedTemplateQueryType.GET_ALL_RENDERED_TEMPLATES:
        stmt = select(RenderedTemplateDB)
    if query_params.query_type == RenderedTemplateQueryType.GET_RENDERED_TEMPLATE_BY_ID:
        stmt = select(RenderedTemplateDB).where(
            RenderedTemplateDB.id == query_params.rendered_template_id
        )
    if (
        query_params.query_type
        == RenderedTemplateQueryType.GET_RENDERED_TEMPLATES_BY_PROTAGONIST_ID
    ):
        stmt = select(RenderedTemplateDB).where(
            RenderedTemplateDB.id == query_params.protagonist_id
        )

    with DBSession() as session:
        try:
            rendered_template_list: List[RenderedTemplateDB] = (
                session.execute(stmt).scalars().all()
            )  # noqa: E501
            return [
                RenderedTemplate(renderedtemplate_id=obj.id, **obj.to_dict())
                for obj in rendered_template_list
            ]
        except Exception as e:
            session.rollback()
            logger.error(f"Unable to fetch rendered_templates due to {e}")
            raise e


def update_rendered_template(
    rendered_template_update: RenderedTemplateUpdate,
) -> RenderedTemplate:
    """Update RenderedTemplate in the DB from RenderedTemplateUpdate request.

    Args:
        rendered_template_update (RenderedTemplateUpdate): RenderedTemplateUpdate request

    Raises:
        Exception: error

    Returns:
        RenderedTemplate: Instance of Updated RenderedTemplate
    """
    stmt = select(RenderedTemplateDB).where(
        RenderedTemplateDB.id == rendered_template_update.rendered_template_id
    )
    with DBSession() as session:
        try:
            rendered_template_list: List[RenderedTemplateDB] = (
                session.execute(stmt).scalars().all()
            )  # noqa: E501
            if len(rendered_template_list) == 1:
                rendered_template_update_dict = rendered_template_update.dict(
                    exclude_defaults=True
                )
                rendered_template_update_dict.pop("rendered_template_id")
                updated_rendered_template = rendered_template_list[0].update(
                    session, **rendered_template_update_dict
                )  # noqa: E501
                return RenderedTemplate(
                    rendered_template_id=updated_rendered_template.id,
                    **updated_rendered_template.to_dict(),
                )
            if len(rendered_template_list) == 0:
                # TODO: Raise not found
                pass
        except Exception as e:
            session.rollback()
            logger.error(
                f"Unable to update rendered template: {rendered_template_update.dict()} due to {e}"
            )  # noqa: E501
            raise e


def delete_rendered_template(
    rendered_template_delete: RenderedTemplateDelete,
) -> RenderedTemplate:
    """Delete rendered template in the DB from RenderedTemplateDelete request.

    Args:
        rendered_template_delete (RenderedTemplateDelete): RenderedTemplateDelete request

    Raises:
        Exception: error

    Returns:
        RenderedTemplate: Instance of Deleted RenderedTemplate
    """
    stmt = select(RenderedTemplateDB).where(
        RenderedTemplateDB.id == rendered_template_delete.rendered_template_id
    )
    with DBSession() as session:
        try:
            rendered_template_list: List[RenderedTemplateDB] = (
                session.execute(stmt).scalars().all()
            )  # noqa: E501
            if len(rendered_template_list) == 1:
                deleted_rendered_template = rendered_template_list[0].delete(session)
                return RenderedTemplate(
                    rendered_template_id=deleted_rendered_template.id,
                    **deleted_rendered_template.to_dict(),
                )
            if len(rendered_template_list) == 0:
                # TODO: Raise not found
                pass
        except Exception as e:
            session.rollback()
            logger.error(
                f"Unable to delete rendered template: {rendered_template_delete.dict()} due to {e}"
            )  # noqa: E501
            raise e
