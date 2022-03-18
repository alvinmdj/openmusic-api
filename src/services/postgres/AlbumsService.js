const { Pool } = require('pg');

class AlbumsService {
  constructor() {
    this._pool = new Pool();
  }

  async addAlbum({ name, year }) {
    
  }

  async getAlbumById() {}

  async editAlbumById() {}

  async deleteAlbumById() {}
}

module.exports = AlbumsService;
