"""
Allows the creation of `mine.properties` as a dict that can later be written.
"""

import os
from typing import Dict, Optional


def create_properties(
    PGHOST: str = "intermine_postgres",
    PGPORT: int = 5432,
    PSQL_USER: str = "postgres",
    PSQL_PWD: str = "postgres",
    TOMCAT_HOST: str = "intermine_tomcat",
    TOMCAT_PORT: int = 8080,
    TOMCAT_USER: str = "tomcat",
    TOMCAT_PWD: str = "tomcat",
    overrides: Optional[Dict[str, str]] = None,
) -> dict:
    properties = {
        # This file specifies the how to access local postgres databases used for
        # building and running and InterMine.bio warehouse.  Also some configuration
        # of InterMine behaviour.
        #######################
        # database properties #
        #######################
        # if true will log details about execution time of every query
        "os.production.verboseQueryLog": "true",
        # Access to the postgres database to build into and access from the webapp
        "db.production.datasource.serverName": PGHOST + ":" + str(PGPORT),
        "db.production.datasource.databaseName": "mine",
        "db.production.datasource.user": PSQL_USER,
        "db.production.datasource.password": PSQL_PWD,
        # Temporary database used during the build process, this is re-built
        # as sources are loaded and can be discarded once the warehouse build is complete
        # It uses the InterMine 'items' metadata format to describe objects.
        # common target items database
        "db.common-tgt-items.datasource.serverName": PGHOST + ":" + str(PGPORT),
        "db.common-tgt-items.datasource.databaseName": "items-mine",
        "db.common-tgt-items.datasource.user": PSQL_USER,
        "db.common-tgt-items.datasource.password": PSQL_PWD,
        # userprofile database - used by the webapp to store logins, query history,
        # saved bags, templates and tags.
        "db.userprofile-production.datasource.serverName": PGHOST + ":" + str(PGPORT),
        "db.userprofile-production.datasource.databaseName": "userprofile-mine",
        "db.userprofile-production.datasource.user": PSQL_USER,
        "db.userprofile-production.datasource.password": PSQL_PWD,
        # files for ID resolvers
        # resolver.file.rootpath=/DATA/idresolver
        #####################
        # webapp properties #
        #####################
        # Web application deployment properties
        # location of tomcat server and path of webapp - e.g. access http://localhost:8080/malariamine
        "webapp.deploy.url": "http://" + TOMCAT_HOST + ":" + str(TOMCAT_PORT),
        "webapp.path": "biotestmine",
        # tomcat username and password needed to deploy webapp
        "webapp.manager": TOMCAT_USER,
        "webapp.password": TOMCAT_PWD,
        # 'Home' link
        "webapp.baseurl": "http://localhost:8080",
        # account name for superuser (who can edit appearance and publish templates)
        "superuser.account": "test_user@mail_account",
        "superuser.initialPassword": "secret",
        # run with no associated web site
        "project.standalone": "true",
        # details for sending login e-mails
        "mail.host": "localhost",
        "mail.from": "account@my_mail_host",
        "mail.subject": "Welcome to MalariaMine",
        "mail.text": "You have successfully created an account on BioTestMine",
        # text that appears in the header and elsewhere
        "project.title": "BioTestMine",
        "project.subTitle": "An example of InterMine.bio with data from <i>Plasmodium falciparum</i>",
        "project.releaseVersion": "tutorial",
        # various URLs use this as the prefix
        "project.sitePrefix": "http://www.flymine.org",
        "project.helpLocation": "http://www.flymine.org/help",
        # recipient of feedback form located on bottom of every page
        "feedback.destination": " test_user@mail_address",
    }

    if overrides:
        properties.update(overrides)

    return properties


def write_properties(filepath: os.PathLike, properties_dict: Dict[str, str]) -> None:
    os.makedirs(os.path.dirname(filepath), exist_ok=True)

    with open(filepath, "w") as f:

        properties_string = ""
        for key in properties_dict:
            value = properties_dict[key]
            properties_string += key + "=" + value + "\n"

        f.write(properties_string)
