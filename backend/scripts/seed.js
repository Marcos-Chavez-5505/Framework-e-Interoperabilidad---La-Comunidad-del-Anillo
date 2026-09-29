const { createStrapi } = require('@strapi/strapi');

const BASE_URL = process.env.APP_BASE_URL || 'http://localhost:1337';

const GENRES = ['Rock épico', 'Folk', 'Ambient'];

const ARTISTS = [
  { name: 'Elfos de Lothlórien', coverFile: 'lothlorien.jpg' },
  { name: 'Rivendel Sessions', coverFile: 'rivendel.jpg' },
  { name: 'Góndor Riffs', coverFile: 'gondor.jpg' },
];

const ALBUMS = [
  { title: 'El Concilio de Elrond', coverFile: 'concilio.jpg', release_date: '2002-01-01', artist: 'Elfos de Lothlórien' },
  { title: 'El Abismo de Helm', coverFile: 'abismo.jpg', release_date: '2002-06-01', artist: 'Góndor Riffs' },
];

const TRACKS = [
  { title: 'La partida de la Comarca', duration: 316, audio_n: 1, release_date: '2002-03-01', artist: 'Elfos de Lothlórien', album: 'El Concilio de Elrond', genre: 'Folk' },
  { title: 'El Concilio de Elrond', duration: 364, audio_n: 2, release_date: '2002-03-01', artist: 'Elfos de Lothlórien', album: 'El Concilio de Elrond', genre: 'Ambient' },
  { title: 'La Cantiga de Bree', duration: 373, audio_n: 3, release_date: '2002-04-01', artist: 'Rivendel Sessions', album: 'El Concilio de Elrond', genre: 'Folk' },
  { title: 'Abismo de Helm en llamas', duration: 433, audio_n: 5, release_date: '2002-08-01', artist: 'Góndor Riffs', album: 'El Abismo de Helm', genre: 'Rock épico' },
];

function assetUrl(file) {
  return `${BASE_URL}/${file}`;
}

function audioUrl(n) {
  return assetUrl(`audio/SoundHelix-Song-${n}.mp3`);
}

function coverSlug(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

const PERMISSIONS = [
  'api::track.track.find',
  'api::track.track.findOne',
  'api::album.album.find',
  'api::album.album.findOne',
  'api::artist.artist.find',
  'api::artist.artist.findOne',
  'api::genre.genre.find',
  'api::genre.genre.findOne',
  'api::follow.follow.create',
  'api::follow.follow.find',
  'api::follow.follow.findOne',
  'api::follow.follow.delete',
  'plugin::users-permissions.user.me',
  'plugin::users-permissions.user.find',
  'plugin::users-permissions.user.findOne',
  'plugin::users-permissions.user.count',
  'plugin::users-permissions.user.updateMe',
  'plugin::users-permissions.auth.logout',
  'plugin::users-permissions.auth.getSessions',
  'plugin::users-permissions.auth.revokeSession',
  'plugin::users-permissions.auth.changePassword',
];

async function syncPermissions(strapi) {
  const role = await strapi.db.query('plugin::users-permissions.role').findOne({
    where: { type: 'authenticated' },
    populate: ['permissions'],
  });
  if (!role) {
    throw new Error('No se encontró el rol "authenticated"');
  }

  const existing = new Set(role.permissions.map((p) => p.action));
  const granted = [];
  for (const action of PERMISSIONS) {
    if (!existing.has(action)) {
      await strapi.db.query('plugin::users-permissions.permission').create({
        data: { action, role: role.id },
      });
      granted.push(action);
    }
  }
  return granted;
}

async function clearCollection(strapi, uid) {
  const docs = strapi.documents(uid);
  const items = await docs.findMany({ fields: ['documentId'] });
  for (const item of items) {
    await docs.delete({ documentId: item.documentId });
  }
  return items.length;
}

async function main() {
  const strapi = createStrapi();
  await strapi.load();

  const removed = {
    tracks: await clearCollection(strapi, 'api::track.track'),
    albums: await clearCollection(strapi, 'api::album.album'),
    artists: await clearCollection(strapi, 'api::artist.artist'),
    genres: await clearCollection(strapi, 'api::genre.genre'),
  };

  const createdGenres = {};
  for (const name of GENRES) {
    const doc = await strapi.documents('api::genre.genre').create({ data: { name } });
    createdGenres[name] = doc.documentId;
  }

  const createdArtists = {};
  for (const a of ARTISTS) {
    const doc = await strapi.documents('api::artist.artist').create({
      data: { name: a.name, cover: assetUrl(`covers/${a.coverFile}`) },
    });
    createdArtists[a.name] = doc.documentId;
  }

  const createdAlbums = {};
  for (const al of ALBUMS) {
    const doc = await strapi.documents('api::album.album').create({
      data: {
        title: al.title,
        cover: assetUrl(`covers/${al.coverFile}`),
        release_date: al.release_date,
        artist: createdArtists[al.artist],
      },
    });
    createdAlbums[al.title] = doc.documentId;
  }

  for (const t of TRACKS) {
    await strapi.documents('api::track.track').create({
      data: {
        title: t.title,
        duration: t.duration,
        audio_url: audioUrl(t.audio_n),
        cover: assetUrl(`covers/${coverSlug(t.title)}.jpg`),
        release_date: t.release_date,
        artist: createdArtists[t.artist],
        album: createdAlbums[t.album],
        genre: createdGenres[t.genre],
      },
    });
  }

  const granted = await syncPermissions(strapi);

  console.log('Seed completado (assets locales en backend/public):');
  console.log(`  Eliminados -> tracks:${removed.tracks} albums:${removed.albums} artists:${removed.artists} genres:${removed.genres}`);
  console.log(`  Creados   -> géneros: ${Object.keys(createdGenres).length}, artistas: ${Object.keys(createdArtists).length}, álbumes: ${Object.keys(createdAlbums).length}, tracks: ${TRACKS.length}`);
  console.log(`  Permisos  -> otorgados: ${granted.length}, ya existentes: ${PERMISSIONS.length - granted.length}`);
  console.log(`  Base de URLs: ${BASE_URL}`);

  await strapi.destroy();
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('ERROR:', err.message);
    process.exit(1);
  });