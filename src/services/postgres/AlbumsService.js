const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class AlbumsService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async addAlbum({ name, year }) {
    const id = `album-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO albums VALUES ($1, $2, $3) RETURNING id',
      values: [id, name, year],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Album could not be created');
    }

    return result.rows[0].id;
  }

  async getAlbumById(id) {
    const albumQuery = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [id],
    };
    const albumResult = await this._pool.query(albumQuery);

    if (!albumResult.rows.length) {
      throw new NotFoundError('Album not found');
    }

    const {
      id: albumId,
      name,
      year,
      cover,
    } = albumResult.rows[0];

    const mappedAlbumResult = {
      id: albumId,
      name,
      year,
      coverUrl: cover ? `http://${process.env.HOST}:${process.env.PORT}/albums/cover-images/${cover}` : null,
    };

    // get songs by album id
    const songsQuery = {
      text: 'SELECT id, title, performer FROM songs WHERE album_id = $1',
      values: [id],
    };
    const songsResult = await this._pool.query(songsQuery);

    if (songsResult.rows.length) {
      return {
        ...mappedAlbumResult,
        songs: songsResult.rows,
      };
    }

    return mappedAlbumResult;
  }

  async editAlbumById(id, { name, year }) {
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id',
      values: [name, year, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Failed to update album, ID not found');
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Failed to delete album, ID not found');
    }
  }

  async addAlbumCoverById(albumId, filename) {
    const query = {
      text: 'UPDATE albums SET cover = $1 WHERE id = $2 RETURNING id',
      values: [filename, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Failed to update album cover, ID not found');
    }
  }

  async verifyAlbumIsExist(albumId) {
    const query = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Album not found');
    }
  }

  async addAlbumLikeOrDislikeById(userId, albumId) {
    const id = `like-${nanoid(16)}`;

    const getUserLikeQuery = {
      text: 'SELECT * FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
      values: [userId, albumId],
    };

    const getUserLikeResult = await this._pool.query(getUserLikeQuery);

    let query = {
      text: 'INSERT INTO user_album_likes VALUES ($1, $2, $3) RETURNING id',
      values: [id, userId, albumId],
    };

    if (getUserLikeResult.rows.length) {
      query = {
        text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2 RETURNING id',
        values: [userId, albumId],
      };
    }

    await this._pool.query(query);
    await this._cacheService.delete(`album-likes-${albumId}`);
  }

  async getAlbumLikeCountById(id) {
    try {
      // get album like counts from cache
      const result = await this._cacheService.get(`album-likes-${id}`);
      return {
        count: JSON.parse(result),
        source: 'cache',
      };
    } catch (error) {
      const query = {
        text: 'SELECT COUNT(*) FROM user_album_likes WHERE album_id = $1',
        values: [id],
      };

      const result = await this._pool.query(query);

      if (!result.rows.length) {
        throw new NotFoundError('No likes found for this album');
      }

      const likeCounts = Number(result.rows[0].count);

      // set album like counts to cache
      await this._cacheService.set(`album-likes-${id}`, JSON.stringify(likeCounts));

      return Number(likeCounts);
    }
  }
}

module.exports = AlbumsService;
