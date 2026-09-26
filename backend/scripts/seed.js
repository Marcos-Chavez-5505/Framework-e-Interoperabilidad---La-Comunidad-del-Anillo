const { createStrapi } = require('@strapi/strapi');

const GENRES = ['Rock épico', 'Folk', 'Ambient', 'Electro-Orquestal', 'Metal sinfónico'];

const ARTISTS = [
  { name: 'La Comunidad del Anillo', cover: 'https://picsum.photos/seed/comunidad/300' },
  { name: 'Elfos de Lothlórien', cover: 'https://picsum.photos/seed/lothlorien/300' },
  { name: 'Rivendel Sessions', cover: 'https://picsum.photos/seed/rivendel/300' },
  { name: 'Góndor Riffs', cover: 'https://picsum.photos/seed/gondor/300' },
  { name: 'Bandas de Mordor', cover: 'https://picsum.photos/seed/mordor/300' },
];

const ALBUMS = [
  { title: 'La Búsqueda de Frodo', cover: 'https://picsum.photos/seed/busqueda/300', release_date: '2001-01-01', artist: 'La Comunidad del Anillo' },
  { title: 'El Concilio de Elrond', cover: 'https://picsum.photos/seed/concilio/300', release_date: '2002-01-01', artist: 'Elfos de Lothlórien' },
  { title: 'El Abismo de Helm', cover: 'https://picsum.photos/seed/abismo/300', release_date: '2002-06-01', artist: 'Góndor Riffs' },
  { title: 'El Retorno del Rey', cover: 'https://picsum.photos/seed/retorno/300', release_date: '2003-01-01', artist: 'Bandas de Mordor' },
];

const TRACKS = [
  { title: 'La partida de la Comarca', duration: 316, audio_n: 1, release_date: '2002-03-01', artist: 'Elfos de Lothlórien', album: 'El Concilio de Elrond', genre: 'Folk' },
  { title: 'El Concilio de Elrond', duration: 364, audio_n: 2, release_date: '2002-03-01', artist: 'Elfos de Lothlórien', album: 'El Concilio de Elrond', genre: 'Ambient' },
  { title: 'La Cantiga de Bree', duration: 373, audio_n: 3, release_date: '2002-04-01', artist: 'Rivendel Sessions', album: 'El Concilio de Elrond', genre: 'Folk' },
  { title: 'Abismo de Helm en llamas', duration: 433, audio_n: 5, release_date: '2002-08-01', artist: 'Góndor Riffs', album: 'El Abismo de Helm', genre: 'Rock épico' },
  { title: 'Carga de los Rohirrim', duration: 319, audio_n: 6, release_date: '2002-08-01', artist: 'Góndor Riffs', album: 'El Abismo de Helm', genre: 'Rock épico' },
  { title: 'Sombra de Minas Morgul', duration: 430, audio_n: 8, release_date: '2003-02-01', artist: 'Bandas de Mordor', album: 'El Retorno del Rey', genre: 'Metal sinfónico' },
  { title: 'Luz de las Dos Torres', duration: 366, audio_n: 9, release_date: '2003-02-01', artist: 'Bandas de Mordor', album: 'El Retorno del Rey', genre: 'Metal sinfónico' },
  { title: 'Frodo y Sam hacia el este', duration: 313, audio_n: 11, release_date: '2001-02-01', artist: 'La Comunidad del Anillo', album: 'La Búsqueda de Frodo', genre: 'Electro-Orquestal' },
  { title: 'El dilema de Gollum', duration: 405, audio_n: 13, release_date: '2001-03-01', artist: 'La Comunidad del Anillo', album: 'La Búsqueda de Frodo', genre: 'Electro-Orquestal' },
  { title: 'La destrucción del Anillo', duration: 409, audio_n: 15, release_date: '2001-04-01', artist: 'La Comunidad del Anillo', album: 'La Búsqueda de Frodo', genre: 'Ambient' },
];

function audioUrl(n) {
  return `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${n}.mp3`;
}

function coverSlug(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

async function main() {
  const strapi = createStrapi();
  await strapi.load();

  const tracks = strapi.documents('api::track.track');
  const existing = await tracks.count();
  if (existing > 0) {
    console.log(`Ya existen ${existing} tracks. Seed omitido (ejecutalo una sola vez).`);
    await strapi.destroy();
    return;
  }

  const createdGenres = {};
  for (const name of GENRES) {
    const doc = await strapi.documents('api::genre.genre').create({ data: { name } });
    createdGenres[name] = doc.documentId;
  }

  const createdArtists = {};
  for (const a of ARTISTS) {
    const doc = await strapi.documents('api::artist.artist').create({
      data: { name: a.name, cover: a.cover },
    });
    createdArtists[a.name] = doc.documentId;
  }

  const createdAlbums = {};
  for (const al of ALBUMS) {
    const doc = await strapi.documents('api::album.album').create({
      data: {
        title: al.title,
        cover: al.cover,
        release_date: al.release_date,
        artist: createdArtists[al.artist],
      },
    });
    createdAlbums[al.title] = doc.documentId;
  }

  for (const t of TRACKS) {
    await tracks.create({
      data: {
        title: t.title,
        duration: t.duration,
        audio_url: audioUrl(t.audio_n),
        cover: `https://picsum.photos/seed/${coverSlug(t.title)}/300`,
        release_date: t.release_date,
        artist: createdArtists[t.artist],
        album: createdAlbums[t.album],
        genre: createdGenres[t.genre],
      },
    });
  }

  console.log('Seed completado:');
  console.log(`  Géneros: ${Object.keys(createdGenres).length}`);
  console.log(`  Artistas: ${Object.keys(createdArtists).length}`);
  console.log(`  Álbumes: ${Object.keys(createdAlbums).length}`);
  console.log(`  Tracks: ${TRACKS.length}`);

  await strapi.destroy();
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('ERROR:', err.message);
    process.exit(1);
  });