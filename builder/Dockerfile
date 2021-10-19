FROM gradle:4.9-jdk8-alpine

# Gradle image doesn't use root.
USER root

RUN apk add --no-cache git \
                       maven \
                       postgresql-client

RUN apk add --no-cache build-base

RUN mkdir /home/intermine && mkdir /home/intermine/intermine
RUN chmod -R 777 /home/intermine

ENV MEM_OPTS="-Xmx16g -Xms1g"
ENV GRADLE_OPTS="-server ${MEM_OPTS} -XX:+UseParallelGC -XX:SoftRefLRUPolicyMSPerMB=1 -XX:MaxHeapFreeRatio=99 -Dorg.gradle.daemon=false -Duser.home=/home/intermine"
ENV HOME="/home/intermine"
ENV USER_HOME="/home/intermine"
ENV GRADLE_USER_HOME="/home/intermine/.gradle"
ENV PSQL_USER="postgres"
ENV PSQL_PWD="postgres"
ENV TOMCAT_USER="tomcat"
ENV TOMCAT_PWD="tomcat"
ENV TOMCAT_PORT=8080
ENV PGPORT=5432

# This is to prime gradle dependencies, so they don't have to be downloaded
# every time the container is run.
RUN apk add --no-cache curl unzip && \
    curl -jksSL -o /tmp/biotestmine-master.zip https://github.com/intermine/biotestmine/archive/refs/heads/master.zip && \
    unzip -qq /tmp/biotestmine-master.zip -d /tmp

WORKDIR /tmp/biotestmine-master
RUN touch dbmodel/resources/biotestmine.properties
# Gradle doesn't provide a straightforward way to only download dependencies.
RUN ./gradlew build -x dbmodel:mergeModels # exclude mergeModels task as it requires project.xml

RUN apk del curl unzip && \
    rm -rf /tmp/* /var/cache/apk/*

# Ensure new files (specifically in .gradle) added to home dir are accessible
# by runtime user.
RUN chmod -R 777 /home/intermine

WORKDIR /home/intermine/intermine
