'use strict';

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/genres',
      handler: 'genre.find',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/genres/:id',
      handler: 'genre.findOne',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/genres',
      handler: 'genre.create',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/genres/:id',
      handler: 'genre.update',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'DELETE',
      path: '/genres/:id',
      handler: 'genre.delete',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};