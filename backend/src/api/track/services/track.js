'use strict';

const fs = require('fs/promises');
const path = require('path');
const { createCoreService } = require('@strapi/strapi').factories;

const QR_BASE = 'https://api.qrcode-monkey.com/qr';
const QR_CUSTOM_ENDPOINT = `${QR_BASE}/custom`;
const QR_UPLOAD_ENDPOINT = `${QR_BASE}/uploadImage`;
const QR_LOGO_PATH = path.join(
  __dirname,
  '../../../../..',
  'frontend/src/assets/own_svgs_icons/logo_synthos.svg'
);
const QR_BODY_COLOR = '#ef2f62';
const QR_BG_COLOR = '#FFFFFF';
const QR_SIZE = 400;
const QR_TIMEOUT_MS = 10000;

const cache = new Map();
let logoFile = null;
let logoPromise = null;

function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

async function fetchWithTimeout(url, options) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), QR_TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function uploadLogo() {
  const buffer = await fs.readFile(QR_LOGO_PATH);
  const form = new FormData();
  form.append(
    'file',
    new Blob([buffer], { type: 'image/svg+xml' }),
    path.basename(QR_LOGO_PATH)
  );

  const response = await fetchWithTimeout(QR_UPLOAD_ENDPOINT, {
    method: 'POST',
    body: form,
  });

  if (!response.ok) {
    throw new Error(`uploadImage respondió ${response.status}`);
  }

  const json = await response.json().catch(() => null);
  if (!json || !json.file) {
    throw new Error('uploadImage no devolvió el archivo');
  }

  return json.file;
}

async function getLogoFile() {
  if (logoFile) return logoFile;
  if (!logoPromise) {
    logoPromise = uploadLogo()
      .then((file) => {
        logoFile = file;
        return file;
      })
      .catch((err) => {
        logoPromise = null;
        throw err;
      });
  }
  return logoPromise;
}

function qrConfig(logo) {
  const config = {
    body: 'rounded-pointed',
    bodyColor: QR_BODY_COLOR,
    bgColor: QR_BG_COLOR,
    eye1Color: QR_BODY_COLOR,
    eye2Color: QR_BODY_COLOR,
    eye3Color: QR_BODY_COLOR,
    eyeBall1Color: QR_BODY_COLOR,
    eyeBall2Color: QR_BODY_COLOR,
    eyeBall3Color: QR_BODY_COLOR,
  };

  if (logo) {
    config.logo = logo;
    config.logoMode = 'clean';
  }

  return config;
}

function requestQr(shareUrl, logo) {
  return fetchWithTimeout(QR_CUSTOM_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      data: shareUrl,
      size: QR_SIZE,
      file: 'png',
      config: qrConfig(logo),
    }),
  });
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

    let logo = null;
    try {
      logo = await getLogoFile();
    } catch (err) {
      strapi.log.warn(`QR sin logo: ${err.message}`);
    }

    let response;
    try {
      response = await requestQr(track.share_url, logo);
    } catch (err) {
      throw httpError(502, 'No se pudo contactar a QR Monkey');
    }

    if (!response.ok) {
      throw httpError(502, `QR Monkey respondió ${response.status}`);
    }

    const png = Buffer.from(await response.arrayBuffer());
    cache.set(documentId, png);
    return png;
  },
}));
