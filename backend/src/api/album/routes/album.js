'use strict';

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/albums',
      handler: 'album.find',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/albums/:id',
      handler: 'album.findOne',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/albums',
      handler: 'album.create',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/albums/:id',
      handler: 'album.update',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'DELETE',
      path: '/albums/:id',
      handler: 'album.delete',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};