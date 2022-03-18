class AlbumsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postAlbumsHandler = this.postAlbumsHandler.bind(this);
    this.getAlbumsHandler = this.getAlbumsHandler.bind(this);
    this.putAlbumsHandler = this.putAlbumsHandler.bind(this);
    this.deleteAlbumsHandler = this.deleteAlbumsHandler.bind(this);
  }

  async postAlbumsHandler() {}

  async getAlbumsHandler() {}

  async putAlbumsHandler() {}

  async deleteAlbumsHandler() {}
}

module.exports = AlbumsHandler;
