# Open Music API (Node.js, Hapi)

## Links

- [Hapi](https://hapi.dev/)
- [Joi](https://joi.dev/api/)
- [PostgreSQL](https://www.postgresql.org/docs/current/index.html)
- [Node-Postgres](https://node-postgres.com/)

## Features

- CRUD albums and songs
- Search song by name and/or performer
- Data validation
- Error handling
- Authentication & Authorization
- Manage playlists (private)
- Playlist collaborations
- Playlist activities history

## Requirements

- Node.js v16.13.2+
- NPM v8.1.2+
- Postgres v13.3+
- Postman (for testing)

## Installation

- Clone this repository:

```sh
git clone https://github.com/alvinmdj/openmusic-api.git
```

- Go to the root directory:

```sh
cd openmusic-api
```

- Install dependencies:

```sh
npm install
```

- Copy ```.env.example``` and paste as ```.env```:

```sh
cp .env.example .env
```

- Create database and setup environment variables in ```.env```:

```sh
# server configs
HOST=localhost
PORT=5000

# node-postgres configs
PGUSER=<username>
PGPASSWORD=<password>
PGDATABASE=<dbname>
PGHOST=localhost
PGPORT=5432

# JWT token
ACCESS_TOKEN_KEY=<secret-key>
REFRESH_TOKEN_KEY=<another-secret-key>
ACCESS_TOKEN_AGE=<duration-in-seconds>

# Message broker
RABBITMQ_SERVER=amqp://localhost

# Redis
REDIS_SERVER=localhost
```

- Run database migration:

```sh
npm run migrate up
```

- Run (development):

```sh
# with nodemon
npm run start
```

- Run lint:

```sh
# ESLint
npm run lint
```

## Testing with Postman

- Make sure the server is running: ```npm run start-dev```.

- Open Postman and import:
  - ```postman_collection.json file```
  - ```postman_environment.json file```

  **Note:** both files are available inside the ```postman``` folder and use the latest version: ```postman-test-v3```.

- In Postman:
  - Set environment to ```OpenMusic API Test```
  - Click ```Open Music API Test collection``` > ```Run collection``` > ```Run Open Music API Test```.

## Notes

- node-pg-migrate:

```sh
# commands used in this project:
npm run migrate create-table-albums
npm run migrate create-table-songs

# after configuring the migration files:
npm run migrate up

# command available after setup migrate script in package.json
npm run migrate ...

# create new migration file
migrate create '<migration name>'

# execute all unrun up migration
migrate up

# execute one down migration from current state
migrate down

# execute previous migration
# this will run a down migration followed with an up migration
migrate redo
```

- Clear database

```sh
# login
psql -U <username> -d <dbname>

# show tables
\dt

# clear data from tables (truncate)
truncate albums, songs, users, authentications, playlists, playlist_songs, playlist_song_activities, collaborations, user_album_likes;

# quit
\q
```
