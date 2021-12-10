"""Mine BLoCs."""

from typing import Dict, List, Optional

from blackcap.db import DBSession
from blackcap.schemas.user import User
from logzero import logger
from sqlalchemy import select

from compose.models.mine import MineDB
from compose.schemas.api.mine.delete import MineDelete
from compose.schemas.api.mine.get import MineGetQueryParams, MineQueryType
from compose.schemas.api.mine.put import MineUpdate
from compose.schemas.mine import Mine


######################
# CRUD BloCs
######################


def create_mine(mine_list: List[Mine], user_creds: Optional[User] = None) -> List[Mine]:
    """Create mine objects.

    Args:
        mine_list (List[Mine]): List of mine objects to create.
        user_creds (Optional[User], optional): User credentials. Defaults to None.

    Raises:
        Exception: Database error

    Returns:
        List[Mine]: Created mine objects
    """
    with DBSession() as session:
        try:
            mine_db_create_list: List[MineDB] = [
                MineDB(
                    protagonist_id=user_creds.user_id,
                    **mine.dict(exclude={"mine_id", "protagonist_id", "template_id"}),
                )
                for mine in mine_list
            ]
            MineDB.bulk_create(mine_db_create_list, session)
            return [
                Mine(mine_id=obj.id, **obj.to_dict()) for obj in mine_db_create_list
            ]
        except Exception as e:
            session.rollback()
            logger.error(f"Unable to create mine: {e}")
            raise e


def get_mine(
    query_params: MineGetQueryParams, user_creds: Optional[User] = None
) -> List[Mine]:
    """Query DB for Mines.

    Args:
        query_params (MineGetQueryParams): Query params from request
        user_creds (Optional[User], optional): User credentials. Defaults to None.

    Raises:
        Exception: error

    Returns:
        List[Mine]: List of Mines returned from DB
    """
    stmt = ""

    if query_params.query_type == MineQueryType.GET_ALL_MINES:
        stmt = select(MineDB)
    if query_params.query_type == MineQueryType.GET_MINE_BY_ID:
        stmt = select(MineDB).where(MineDB.id == query_params.mine_id)
    if query_params.query_type == MineQueryType.GET_MINES_BY_PROTAGONIST_ID:
        stmt = select(MineDB).where(MineDB.id == query_params.protagonist_id)

    with DBSession() as session:
        try:
            mine_list: List[MineDB] = session.execute(stmt).scalars().all()
            return [Mine(mine_id=obj.id, **obj.to_dict()) for obj in mine_list]
        except Exception as e:
            session.rollback()
            logger.error(f"Unable to fetch mine due to {e}")
            raise e


def update_mine(mine_update: MineUpdate, user_creds: Optional[User] = None) -> Mine:
    """Update Mine in the DB from MineUpdate request.

    Args:
        mine_update (MineUpdate): MineUpdate request
        user_creds (Optional[User], optional): User credentials. Defaults to None.

    Raises:
        Exception: error

    Returns:
        Mine: Instance of Updated Mine
    """
    stmt = select(MineDB).where(MineDB.id == mine_update.mine_id)
    with DBSession() as session:
        try:
            mine_list: List[MineDB] = session.execute(stmt).scalars().all()
            if len(mine_list) == 1:
                mine_update_dict = mine_update.dict(exclude_defaults=True)
                mine_update_dict.pop("mine_id")
                updated_mine = mine_list[0].update(session, **mine_update_dict)
                return Mine(data_id=updated_mine.id, **updated_mine.to_dict())
            if len(mine_list) == 0:
                # TODO: Raise not found
                pass
        except Exception as e:
            session.rollback()
            logger.error(f"Unable to update mine: {mine_update.dict()} due to {e}")
            raise e


def delete_mine(mine_delete: MineDelete, user_creds: Optional[User] = None) -> Mine:
    """Delete Mine in the DB from MineDelete request.

    Args:
        mine_delete (MineDelete): MineDelete request
        user_creds (Optional[User], optional): User credentials. Defaults to None.

    Raises:
        Exception: error

    Returns:
        Mine: Instance of Deleted Mine
    """
    stmt = select(MineDB).where(MineDB.id == mine_delete.mine_id)
    with DBSession() as session:
        try:
            mine_list: List[MineDB] = session.execute(stmt).scalars().all()
            if len(mine_list) == 1:
                deleted_mine = mine_list[0].delete(session)
                return Mine(mine_id=deleted_mine.id, **deleted_mine.to_dict())
            if len(mine_list) == 0:
                # TODO: Raise not found
                pass
        except Exception as e:
            session.rollback()
            logger.error(f"Unable to delete mine: {mine_delete.dict()} due to {e}")
            raise e


######################
# Flow BloCs
######################

# TODO: Add `flow_graph` and `flow_state` data structures
# TODO: Add `reverse_flow(flow_state)` function for each flow


def create_mine_flow(
    mine_list: List[Mine],
    interface: str,
    inteface_params: Dict,
    user_creds: Optional[User] = None,
) -> List[Mine]:
    """Create mine flow.

    Args:
        mine_list (List[Mine]): List of mine objects to create.
        interface (str): Interface used to initiate the request. options include "cli" and "rest".
        inteface_params (Dict): Parameters specific to the interface.
        user_creds (Optional[User], optional): [description]. Defaults to None.

    Returns: # noqa: DAR202
        List[Mine]: Created mine objects
    """
    pass


def create_mine_reverse_flow(
    mine_list: List[Mine],
    interface: str,
    inteface_params: Dict,
    flow_state: Dict,
    user_creds: Optional[User] = None,
) -> None:
    """Create mine flow.

    Args:
        mine_list (List[Mine]): List of mine objects to create.
        interface (str): Interface used to initiate the request. options include "cli" and "rest".
        inteface_params (Dict): Parameters specific to the interface.
        flow_state (Dict): FlowState object.
        user_creds (Optional[User], optional): [description]. Defaults to None.
    """
    pass
