require('dotenv').config();

const Hapi = require('@hapi/hapi');

// exceptions
const ClientError = require('./exceptions/ClientError');

// albums
const albums = require('./api/albums');
const AlbumsService = require('./services/postgres/AlbumsService');
const AlbumsValidator = require('./validator/albums');

// songs
const songs = require('./api/songs');
const SongsService = require('./services/postgres/SongsService');
const SongsValidator = require('./validator/songs');

// users
const users = require('./api/users');
const UsersService = require('./services/postgres/UsersService');
const UsersValidator = require('./validator/users');

// server init
const init = async () => {
  // init service instances
  const albumsService = new AlbumsService();
  const songsService = new SongsService();
  const usersService = new UsersService();

  // server setup
  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  // register plugins
  await server.register([
    {
      plugin: albums,
      options: {
        service: albumsService,
        validator: AlbumsValidator,
      },
    },
    {
      plugin: songs,
      options: {
        service: songsService,
        validator: SongsValidator,
      },
    },
    {
      plugin: users,
      options: {
        service: usersService,
        validator: UsersValidator,
      },
    },
  ]);

  // error handling
  server.ext('onPreResponse', (request, h) => {
    // get response contexts from request
    const { response } = request;
    if (response instanceof ClientError) {
      // create new response from response toolkit depending on error handling needs
      const newResponse = h.response({
        status: 'fail',
        message: response.message,
      });
      newResponse.code(response.statusCode);
      return newResponse;
    }

    // if not ClientError, continue with the previous response (without intervention)
    return response.continue || response;
  });

  // start server
  await server.start();
  console.log(`Server running on: ${server.info.uri}`);
};

process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});

init();
