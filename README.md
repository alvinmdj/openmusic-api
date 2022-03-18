# Open Music API (Node.js, Hapi)

## Links

- [Hapi](https://hapi.dev/)
- [Joi](https://joi.dev/api/)
- [Node-Postgres](https://node-postgres.com/)

## Requirements

- Node.js v16.13.2+
- NPM v8.1.2
- Postgres v13.3+
- Postman (for testing)

## Installation

- Clone this repository:

```sh
git clone https://github.com/alvinmdj/notes-app-back-end.git
```

- Go to the root directory:

```sh
cd notes-app-back-end
```

- Install dependencies:

```sh
npm install
```

- Run (development):

```sh
# with nodemon
npm run start-dev
```

- Run lint:

```sh
# ESLint
npm run lint
```

## Testing with Postman

- Make sure the server is running: ```npm run start-dev```.

- Open Postman and import:
  - ```Open Music API Test.postman_collection.json```
  - ```Open Music API Test.postman_environment.json```
  **Note:** both files are available inside the ```postman``` folder.

- In Postman, click ```Notes API Test collection``` > ```Run collection``` > ```Run Notes API Test```.

## Notes

- node-pg-migrate:

```sh
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

- Nodemon:

```sh
npm install nodemon --save-dev

# Setup in package.json: "start": "nodemon ./src/server.js"
npm run start
```

- ESLint:

```sh
npm install eslint --save-dev

# Configure eslint
npx eslint --init

# Setup in package.json: "lint": "eslint ./src"
npm run lint

# https://www.dicoding.com/academies/261/tutorials/14757?from=14752
```
