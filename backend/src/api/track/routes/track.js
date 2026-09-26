'use strict';

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/tracks',
      handler: 'track.find',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/tracks/:id',
      handler: 'track.findOne',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/tracks',
      handler: 'track.create',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/tracks/:id',
      handler: 'track.update',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'DELETE',
      path: '/tracks/:id',
      handler: 'track.delete',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};