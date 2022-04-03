const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class PlaylistsService {
  constructor(collaborationsService, cacheService) {
    this._pool = new Pool();
    this._collaborationsService = collaborationsService;
    this._cacheService = cacheService;
  }

  async addPlaylist({ name, owner }) {
    const id = `playlist-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlists (id, name, owner) VALUES ($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Playlist could not be created');
    }

    await this._cacheService.delete(`playlists-${owner}`);
    return result.rows[0].id;
  }

  async getPlaylists(user) {
    try {
      // get playlists from cache
      const result = await this._cacheService.get(`playlists-${user}`);
      return JSON.parse(result);
    } catch (error) {
      // if cache is empty, get playlists from db
      const query = {
        text: `
          SELECT playlists.id, playlists.name, users.username FROM playlists
          LEFT JOIN users ON playlists.owner = users.id
          LEFT JOIN collaborations ON playlists.id = collaborations.playlist_id
          WHERE playlists.owner = $1 OR collaborations.user_id = $1
        `,
        values: [user],
      };

      const result = await this._pool.query(query);

      // save playlists to cache
      await this._cacheService.set(`playlists-${user}`, JSON.stringify(result.rows));

      return result.rows;
    }
  }

  async deletePlaylistById(id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id, owner',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Failed to delete playlist. Id not found');
    }

    const { owner } = result.rows[0];
    await this._cacheService.delete(`playlists-${owner}`);
  }

  async verifyPlaylistOwner(id, owner) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Failed to verify playlist owner. Id not found');
    }

    const playlist = result.rows[0];

    if (playlist.owner !== owner) {
      throw new AuthorizationError('You are not authorized to perform this action');
    }
  }

  async addPlaylistSong(playlistId, songId, userId) {
    const id = `playlist-song-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlist_songs (id, playlist_id, song_id) VALUES ($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Song could not be added to playlist');
    }

    await this.addPlaylistActivity(playlistId, songId, userId, 'add');

    await this._cacheService.delete(`playlists-${userId}`);
    return result.rows[0].id;
  }

  async getPlaylistSongs(playlistId) {
    const playlistQuery = {
      text: `
        SELECT playlists.id, playlists.name, users.username
        FROM playlists
        INNER JOIN users ON playlists.owner = users.id
        WHERE playlists.id = $1
      `,
      values: [playlistId],
    };

    const playlistResult = await this._pool.query(playlistQuery);

    if (!playlistResult.rows.length) {
      throw new InvariantError('Playlist not found');
    }

    const songsQuery = {
      text: `
        SELECT songs.id, songs.title, songs.performer FROM songs
        INNER JOIN playlist_songs ON songs.id = playlist_songs.song_id
        WHERE playlist_songs.playlist_id = $1
      `,
      values: [playlistId],
    };

    const songsResult = await this._pool.query(songsQuery);

    if (!songsResult.rows.length) {
      throw new InvariantError('Playlist songs could not be retrieved');
    }

    return {
      ...playlistResult.rows[0],
      songs: songsResult.rows,
    };
  }

  async deletePlaylistSong(playlistId, songId, userId) {
    const query = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Failed to delete song from playlist');
    }

    await this._cacheService.delete(`playlists-${userId}`);
    await this.addPlaylistActivity(playlistId, songId, userId, 'delete');
  }

  async verifyPlaylistIsExist(id) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Playlist not found');
    }
  }

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      // check if playlist owner
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      // if not a NotFoundError, try to verify if user is collaborator
      try {
        await this._collaborationsService.verifyCollaborator(playlistId, userId);
      } catch {
        throw error;
      }
    }
  }

  async addPlaylistActivity(playlistId, songId, userId, action) {
    const id = `activity-${nanoid(16)}`;
    const time = new Date().toISOString();

    const query = {
      text: 'INSERT INTO playlist_song_activities VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      values: [id, playlistId, songId, userId, action, time],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Failed to add activity');
    }
  }

  async getPlaylistActivities(playlistId) {
    const query = {
      text: `
        SELECT users.username, songs.title, playlist_song_activities.action, playlist_song_activities.time
        FROM playlist_song_activities
        INNER JOIN users ON playlist_song_activities.user_id = users.id
        INNER JOIN songs ON playlist_song_activities.song_id = songs.id
        WHERE playlist_song_activities.playlist_id = $1
      `,
      values: [playlistId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Failed to retrieve playlist activities');
    }

    return result.rows;
  }
}

module.exports = PlaylistsService;
