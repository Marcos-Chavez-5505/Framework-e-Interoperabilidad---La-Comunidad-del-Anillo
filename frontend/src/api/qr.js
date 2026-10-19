import { strapiClient } from './strapi';

const cache = new Map();
const QR_CACHE_VERSION = 2;

export function fetchQrBlob(documentId) {
  if (cache.has(documentId)) {
    return Promise.resolve(cache.get(documentId));
  }

  return strapiClient
    .get(`/tracks/${documentId}/qr`, {
      responseType: 'blob',
      timeout: 15000,
      params: { v: QR_CACHE_VERSION },
    })
    .then(({ data }) => {
      cache.set(documentId, data);
      return data;
    });
}

export async function getQrErrorMessage(error) {
  const data = error?.response?.data;
  if (data instanceof Blob) {
    try {
      const parsed = JSON.parse(await data.text());
      if (parsed?.error?.message) return parsed.error.message;
    } catch {
      // el cuerpo no era JSON
    }
  }

  const status = error?.response?.status;
  if (status === 404) return 'La canción no tiene enlace de Jamendo para generar el QR.';
  if (status === 401) return 'Tenés que iniciar sesión para generar el QR.';
  if (status === 502) return 'No se pudo generar el QR. Intentá de nuevo.';
  return error?.message || 'No se pudo generar el QR.';
}

export function clearQrCache() {
  cache.clear();
}
