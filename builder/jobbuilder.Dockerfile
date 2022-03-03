FROM python:3.8.12

# Previous attempts to add Python to gradle:7.4.0-jdk11-alpine have been fruitless, finally getting stuck at:
#     Command ['/usr/bin/pip', 'uninstall', 'distlib', '-y'] errored with the following return code 1, and output:
#     Found existing installation: distlib 0.3.3
#     ERROR: Cannot uninstall 'distlib'. It is a distutils installed project and thus we cannot accurately determine which files belong to it which would lead to only a partial uninstall.

ENV APT_KEY_DONT_WARN_ON_DANGEROUS_USAGE=DontWarn

RUN set -e; \
    apt-get update; \
    apt-get install -y --no-install-recommends \
        software-properties-common \
    ; \
    apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys 0xB1998361219BD9C9; \
    apt-add-repository 'deb http://repos.azulsystems.com/debian stable main'; \
    apt-get update; \
    apt-get install -y --no-install-recommends \
        zulu-11

ENV \
  PYTHONFAULTHANDLER=1 \
  PYTHONUNBUFFERED=1 \
  PYTHONHASHSEED=random \
  PIP_NO_CACHE_DIR=off \
  PIP_DISABLE_PIP_VERSION_CHECK=on \
  PIP_DEFAULT_TIMEOUT=100 \
  POETRY_VERSION=1.1.8 \
  CRYPTOGRAPHY_DONT_BUILD_RUST=1 \
  HOME=/home/intermine \
  USER_HOME=/home/intermine \
  MEM_OPTS="-Xmx16g -Xms1g" \
  GRADLE_OPTS="-server -Xmx16g -Xms1g -XX:+UseParallelGC -XX:SoftRefLRUPolicyMSPerMB=1 -XX:MaxHeapFreeRatio=99 -Dorg.gradle.daemon=false -Duser.home=/home/intermine" \
  GRADLE_USER_HOME="/home/intermine/.gradle"

RUN apt-get install -y --no-install-recommends \
  libffi-dev \
  openssl \
  maven \
  postgresql-client
RUN apt-get clean
RUN rm -rf /var/tmp/* /tmp/* /var/lib/apt/lists/*

# When using alpine image:
#RUN apk add --no-cache build-base libffi-dev maven postgresql-client rust cargo openssl-dev
RUN ln -sf python3 /usr/bin/python
RUN pip3 install "poetry==$POETRY_VERSION"

WORKDIR /code
COPY poetry.lock pyproject.toml src /code/

RUN poetry config virtualenvs.create false \
  && poetry install --no-dev --no-interaction --no-ansi

# For when using builder_job
RUN mkdir -p /home/intermine
RUN chmod -R 777 /home/intermine

CMD ["builder_job"]
