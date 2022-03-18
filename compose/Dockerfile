FROM python:3.8-alpine AS python-build-env
LABEL maintainer="Ank"

RUN apk update && apk add ca-certificates curl && apk add libpq postgresql-dev && apk add libffi-dev \
    && apk add build-base && rm -rf /var/cache/apk/*

WORKDIR /compose

ENV PIP_DEFAULT_TIMEOUT=100 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PIP_NO_CACHE_DIR=1 \
    POETRY_VERSION=1.1.8

RUN pip install "poetry==$POETRY_VERSION"
RUN python -m venv venv

ADD pyproject.toml poetry.lock /compose/
RUN poetry export -f requirements.txt | venv/bin/pip install -r /dev/stdin

COPY . /compose
RUN poetry build && venv/bin/pip install dist/*.whl


FROM python:3.8-alpine
LABEL maintainer="Ank"

RUN apk update && apk add ca-certificates curl && apk add libpq postgresql-client

WORKDIR /compose

ENV PATH="/compose/venv/bin:$PATH" \
    FLASK_APP=compose

COPY --from=python-build-env /compose/venv venv
RUN ls venv/bin/

EXPOSE 9991

CMD compose db init && compose run
