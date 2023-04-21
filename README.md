## Installation

```bash
# set correct Node
nvm use $(cat nodeV)

# install
$ npm install
```

## Running the app

```bash
# start
$ npm run start

# development
$ npm run start:dev
```

```bash
# build app
$ docker-compose build

# run app
$ docker-compose up

# run redis only
$ docker-compose -f docker-compose-storage-only.yml up
```

## Tests

Tests need to be run after the main service is started

```bash
# start
$ npm run test
```
