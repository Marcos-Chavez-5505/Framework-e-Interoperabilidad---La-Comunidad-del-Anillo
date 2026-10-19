const path = require('path');
const fs = require('fs');
const { createStrapi } = require('@strapi/strapi');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const CLIENT_ID = process.env.JAMENDO_CLIENT_ID;
const JAMENDO_TRACKS_URL = 'https://api.jamendo.com/v3.0/tracks/';

// Catálogo fijo: la primera corrida lo congela en data/jamendo-seed-ids.json.
// Las corridas siguientes consultan Jamendo por tags y solo actualizan ids del manifest.
const MANIFEST_PATH = path.join(__dirname, '..', 'data', 'jamendo-seed-ids.json');
const TARGET_TRACKS = 50;
const PER_GENRE_LIMIT = 10;
const GENRE_TAGS = ['rock', 'pop', 'jazz', 'electronic', 'classical', 'hiphop', 'world'];

function readManifest() {
  if (!fs.existsSync(MANIFEST_PATH)) return null;
  try {
    const ids = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
    return Array.isArray(ids) && ids.length ? ids.map(String) : null;
  } catch {
    return null;
  }
}

function writeManifest(ids) {
  fs.mkdirSync(path.dirname(MANIFEST_PATH), { recursive: true });
  fs.writeFileSync(MANIFEST_PATH, `${JSON.stringify(ids, null, 2)}\n`);
}

async function requestJamendo(query) {
  const url = `${JAMENDO_TRACKS_URL}?client_id=${encodeURIComponent(CLIENT_ID)}&format=json&${query}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Jamendo respondió HTTP ${res.status}`);
  const data = await res.json();
  const status = data.headers && data.headers.status;
  if (status !== 'success') {
    const code = data.headers ? data.headers.code : '?';
    throw new Error(`Jamendo status="${status}" code=${code}`);
  }
  return data.results || [];
}

async function collectByTags() {
  const byId = new Map();
  for (const tag of GENRE_TAGS) {
    const params = new URLSearchParams({
      limit: String(PER_GENRE_LIMIT),
      tags: tag,
      include: 'musicinfo',
      audioformat: 'mp32',
    });
    const results = await requestJamendo(params.toString());
    for (const t of results) {
      if (!t.id || !t.audio) continue;
      if (!byId.has(String(t.id))) byId.set(String(t.id), t);
    }
    if (byId.size >= TARGET_TRACKS) break;
  }
  return [...byId.values()].slice(0, TARGET_TRACKS);
}

function firstGenre(track) {
  const genres = (track.musicinfo && track.musicinfo.tags && track.musicinfo.tags.genres) || [];
  return genres[0] || null;
}

function shareUrlFor(jamendoId) {
  return `https://www.jamendo.com/track/${jamendoId}`;
}

function jamendoIdFromAudioUrl(audioUrl) {
  if (!audioUrl) return null;
  try {
    return new URL(audioUrl).searchParams.get('trackid');
  } catch {
    return null;
  }
}

// Repara filas creadas por versiones anteriores del seed, que no guardaban
// jamendo_id/share_url. El trackid viaja en audio_url, así que se puede derivar.
async function backfillTrackMetadata(strapi) {
  const docs = strapi.documents('api::track.track');
  const items = await docs.findMany({
    fields: ['documentId', 'jamendo_id', 'audio_url', 'share_url'],
  });
  let fixed = 0;
  for (const item of items) {
    const jamendoId = item.jamendo_id || jamendoIdFromAudioUrl(item.audio_url);
    if (!jamendoId) continue;
    const shareUrl = shareUrlFor(jamendoId);
    if (item.jamendo_id === jamendoId && item.share_url === shareUrl) continue;
    await docs.update({
      documentId: item.documentId,
      data: { jamendo_id: jamendoId, share_url: shareUrl },
    });
    fixed += 1;
  }
  return fixed;
}

async function findOrCreateGenre(strapi, cache, name) {
  if (!name) return null;
  const key = name.trim();
  if (!key) return null;
  if (cache.has(key)) return cache.get(key);
  const existing = await strapi.documents('api::genre.genre').findFirst({ filters: { name: key } });
  const doc = existing || (await strapi.documents('api::genre.genre').create({ data: { name: key } }));
  cache.set(key, doc.documentId);
  return doc.documentId;
}

async function findOrCreateArtist(strapi, cache, track) {
  const name = track.artist_name;
  if (!name) return null;
  const key = name.trim();
  if (!key) return null;
  if (cache.has(key)) return cache.get(key);
  const existing = await strapi.documents('api::artist.artist').findFirst({ filters: { name: key } });
  const doc =
    existing ||
    (await strapi.documents('api::artist.artist').create({
      data: { name: key, cover: track.image || null },
    }));
  cache.set(key, doc.documentId);
  return doc.documentId;
}

async function findOrCreateAlbum(strapi, cache, track, artistId) {
  const title = track.album_name;
  if (!title) return null;
  const key = title.trim();
  if (!key) return null;
  if (cache.has(key)) return cache.get(key);
  const existing = await strapi.documents('api::album.album').findFirst({ filters: { title: key } });
  const doc =
    existing ||
    (await strapi.documents('api::album.album').create({
      data: {
        title: key,
        cover: track.image || null,
        release_date: track.releasedate || null,
        artist: artistId || null,
      },
    }));
  cache.set(key, doc.documentId);
  return doc.documentId;
}

async function upsertTrack(strapi, track, genreId, artistId, albumId) {
  const jamendoId = String(track.id);
  const data = {
    title: track.name,
    duration: Number(track.duration) || null,
    audio_url: track.audio,
    cover: track.image || null,
    release_date: track.releasedate || null,
    jamendo_id: jamendoId,
    license_url: track.license_ccurl || '',
    share_url: track.shareurl || shareUrlFor(jamendoId),
    genre: genreId || null,
    artist: artistId || null,
    album: albumId || null,
  };

  const existing = await strapi
    .documents('api::track.track')
    .findFirst({ filters: { jamendo_id: jamendoId } });

  if (existing) {
    await strapi.documents('api::track.track').update({ documentId: existing.documentId, data });
    return 'updated';
  }
  await strapi.documents('api::track.track').create({ data });
  return 'created';
}

async function main() {
  if (!CLIENT_ID) {
    console.error('ERROR: falta JAMENDO_CLIENT_ID. Cargá tu client_id en backend/.env.');
    process.exit(1);
  }

  let manifest = readManifest();
  let tracks;

  if (manifest) {
    const fetched = await collectByTags();
    const allowed = new Set(manifest);
    tracks = fetched.filter((t) => allowed.has(String(t.id)));
    console.log(`Catálogo fijo: ${manifest.length} ids (data/jamendo-seed-ids.json)`);
    console.log(`  Coincidencias en esta consulta: ${tracks.length}`);
    if (tracks.length === 0) {
      console.warn('  Aviso: Jamendo no devolvió ningún id del catálogo fijo; no se modifica nada.');
      return;
    }
  } else {
    tracks = await collectByTags();
    if (tracks.length === 0) {
      console.error('ERROR: Jamendo no devolvió tracks utilizables.');
      process.exit(1);
    }
    writeManifest(tracks.map((t) => String(t.id)));
    console.log(`Catálogo fijo creado: ${tracks.length} ids -> data/jamendo-seed-ids.json`);
  }

  const strapi = createStrapi();
  await strapi.load();

  const backfilled = await backfillTrackMetadata(strapi);

  const genreCache = new Map();
  const artistCache = new Map();
  const albumCache = new Map();
  let created = 0;
  let updated = 0;

  for (const track of tracks) {
    const genreId = await findOrCreateGenre(strapi, genreCache, firstGenre(track));
    const artistId = await findOrCreateArtist(strapi, artistCache, track);
    const albumId = await findOrCreateAlbum(strapi, albumCache, track, artistId);
    const outcome = await upsertTrack(strapi, track, genreId, artistId, albumId);
    if (outcome === 'created') created += 1;
    else updated += 1;
  }

  const totalTracks = await strapi.db.query('api::track.track').count();
  const totalGenres = await strapi.db.query('api::genre.genre').count();

  console.log('Seed Jamendo completado:');
  console.log(`  Tracks procesados : ${tracks.length} (creados: ${created}, actualizados: ${updated})`);
  console.log(`  Backfill metadata : ${backfilled}`);
  console.log(`  Géneros evaluados : ${genreCache.size}`);
  console.log(`  Total tracks      : ${totalTracks}`);
  console.log(`  Total géneros     : ${totalGenres}`);

  await strapi.destroy();
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('ERROR:', err.message);
    process.exit(1);
  });
