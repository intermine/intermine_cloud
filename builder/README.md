# intermine_builder

Wrapper for building InterMine instances

## Getting started

You will need the Python [Poetry package manager](https://python-poetry.org/docs/).

```
poetry install
```

## Development

You might need to start your editor from `poetry shell` to get all of the IDE features.

You will need a `data` folder containing the various volumes used for a mine. You can use [intermine_boot](https://github.com/intermine/intermine_boot) to create this.

```
intermine_boot build local
unzip BioTestMine-tutorial.zip -d data
```

Install [docker](https://docs.docker.com/install/) and [docker-compose](https://docs.docker.com/compose/install/). The builder relies on other services being available, which we'll create using the Compose file.

```
docker-compose up --build --force-recreate
```

Now you can use this library from the Python interpreter.

```
poetry shell
python3
>>> from intermine_builder import MineBuilder
>>> m = MineBuilder({ 'mine': 'biotestmine' })
```
