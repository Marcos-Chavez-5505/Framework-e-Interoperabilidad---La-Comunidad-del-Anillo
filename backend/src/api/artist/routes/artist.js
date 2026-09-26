'use strict';

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/artists',
      handler: 'artist.find',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/artists/:id',
      handler: 'artist.findOne',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/artists',
      handler: 'artist.create',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/artists/:id',
      handler: 'artist.update',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'DELETE',
      path: '/artists/:id',
      handler: 'artist.delete',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};