'use strict';

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/follows',
      handler: 'follow.find',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/follows/:id',
      handler: 'follow.findOne',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/follows',
      handler: 'follow.create',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/follows/:id',
      handler: 'follow.update',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'DELETE',
      path: '/follows/:id',
      handler: 'follow.delete',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};