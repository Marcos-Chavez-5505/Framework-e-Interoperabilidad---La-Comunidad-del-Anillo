'use strict';

const { createCoreService } = require('@strapi/strapi').factories;

const QR_ENDPOINT = 'https://api.qrcode-monkey.com/qr/custom';
const QR_BODY_COLOR = '#e0407e';
const QR_BG_COLOR = '#FFFFFF';
const QR_SIZE = 300;
const QR_TIMEOUT_MS = 10000;

const cache = new Map();

function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

module.exports = createCoreService('api::track.track', ({ strapi }) => ({
  async getQrPng(documentId) {
    if (cache.has(documentId)) {
      return cache.get(documentId);
    }

    const track = await strapi
      .documents('api::track.track')
      .findOne({ documentId, fields: ['share_url'] });

    if (!track) {
      throw httpError(404, 'Track no encontrado');
    }
    if (!track.share_url) {
      throw httpError(404, 'El track no tiene share_url');
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), QR_TIMEOUT_MS);

    let response;
    try {
      response = await fetch(QR_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          data: track.share_url,
          size: QR_SIZE,
          file: 'png',
          config: { bodyColor: QR_BODY_COLOR, bgColor: QR_BG_COLOR },
        }),
      });
    } catch (err) {
      throw httpError(502, 'No se pudo contactar a QR Monkey');
    } finally {
      clearTimeout(timer);
    }

    if (!response.ok) {
      throw httpError(502, `QR Monkey respondió ${response.status}`);
    }

    const png = Buffer.from(await response.arrayBuffer());
    cache.set(documentId, png);
    return png;
  },
}));
