'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::track.track', ({ strapi }) => ({
  async qr(ctx) {
    const { documentId } = ctx.params;
    try {
      const png = await strapi.service('api::track.track').getQrPng(documentId);
      ctx.set('Content-Type', 'image/png');
      ctx.set('Cache-Control', 'public, max-age=86400');
      ctx.body = png;
    } catch (err) {
      ctx.status = err.status || 502;
      ctx.body = {
        error: {
          status: ctx.status,
          name: 'QrError',
          message: err.message,
        },
      };
    }
  },
}));
