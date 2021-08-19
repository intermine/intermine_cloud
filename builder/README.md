# intermine_builder

Build process for InterMine instances

## Getting started

You will need the Python [Poetry package manager](https://python-poetry.org/docs/).

```
poetry install
```

## Development

You might need to start your editor from `poetry shell` to get all of the IDE features.

Normally you'd run the app with `poetry run app example/input.json` but you should instead use the docker container. Currently, only preset mines are supported, so you will need [intermine_boot](https://github.com/intermine/intermine_boot) to build one first.

```
intermine_boot build local
unzip BioTestMine-tutorial.zip -d data
```

Install [docker](https://docs.docker.com/install/) and [docker-compose](https://docs.docker.com/compose/install/). The docker container relies on other services being available, which we'll create using the Compose file.

```
docker-compose up --build --force-recreate
```
