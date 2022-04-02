class AlbumsHandler {
  constructor(albumsService, storageService, validator) {
    this._albumsService = albumsService;
    this._storageService = storageService;
    this._validator = validator;

    this.postAlbumHandler = this.postAlbumHandler.bind(this);
    this.getAlbumByIdHandler = this.getAlbumByIdHandler.bind(this);
    this.putAlbumByIdHandler = this.putAlbumByIdHandler.bind(this);
    this.deleteAlbumByIdHandler = this.deleteAlbumByIdHandler.bind(this);
    this.postAlbumCoverByIdHandler = this.postAlbumCoverByIdHandler.bind(this);
    this.postAlbumLikeByIdHandler = this.postAlbumLikeByIdHandler.bind(this);
    this.getAlbumLikeCountByIdHandler = this.getAlbumLikeCountByIdHandler.bind(this);
  }

  async postAlbumHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);
    const { name, year } = request.payload;

    const albumId = await this._albumsService.addAlbum({ name, year });

    const response = h.response({
      status: 'success',
      data: { albumId },
    });
    response.code(201);
    return response;
  }

  async getAlbumByIdHandler(request) {
    const { id } = request.params;
    const album = await this._albumsService.getAlbumById(id);
    return {
      status: 'success',
      data: {
        album,
      },
    };
  }

  async putAlbumByIdHandler(request) {
    this._validator.validateAlbumPayload(request.payload);
    const { id } = request.params;

    await this._albumsService.editAlbumById(id, request.payload);

    return {
      status: 'success',
      message: 'Album updated successfully',
    };
  }

  async deleteAlbumByIdHandler(request) {
    const { id } = request.params;

    await this._albumsService.deleteAlbumById(id);

    return {
      status: 'success',
      message: 'Album deleted successfully',
    };
  }

  async postAlbumCoverByIdHandler(request, h) {
    const { id: albumId } = request.params;
    const { cover } = request.payload;

    this._validator.validateImageHeaders(cover.hapi.headers);

    const filename = await this._storageService.writeFile(cover, cover.hapi);
    // const fileLocation = `http://${process.env.HOST}:${process.env.PORT}/albums/cover-images/${filename}`;

    await this._albumsService.addAlbumCoverById(albumId, filename);

    const response = h.response({
      status: 'success',
      message: 'Sampul berhasil diunggah',
    });
    response.code(201);
    return response;
  }

  async postAlbumLikeByIdHandler(request, h) {
    const { id: userId } = request.auth.credentials;
    const { id: albumId } = request.params;

    await this._albumsService.verifyAlbumIsExist(albumId);
    await this._albumsService.addAlbumLikeOrDislikeById(userId, albumId);

    const response = h.response({
      status: 'success',
      message: 'Album liked successfully',
    });
    response.code(201);
    return response;
  }

  async getAlbumLikeCountByIdHandler(request) {
    const { id } = request.params;

    await this._albumsService.verifyAlbumIsExist(id);
    const likes = await this._albumsService.getAlbumLikeCountById(id);

    return {
      status: 'success',
      data: { likes },
    };
  }
}

module.exports = AlbumsHandler;
