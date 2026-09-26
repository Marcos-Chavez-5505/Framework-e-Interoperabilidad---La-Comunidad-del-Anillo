import { useCallback, useEffect, useState } from 'react';
import { strapiClient, getErrorMessage } from '../api/strapi';
import { usePlayer } from '../player/usePlayer';
import { formatDuration } from '../player/context';
import PlayerIcon from '../player/Icons';
import useFeather from '../hooks/useFeather';

function TrackRow({ track, indexInList, playing, onPlay }) {
  return (
    <li className="list-group-item d-flex align-items-center gap-3">
      {track.cover ? (
        <img
          src={track.cover}
          alt={''}
          className="rounded"
          style={{ width: '2.5rem', height: '2.5rem', objectFit: 'cover' }}
        />
      ) : (
        <div
          className="rounded gradient-card text-white d-flex align-items-center justify-content-center"
          style={{ width: '2.5rem', height: '2.5rem' }}
        >
          <PlayerIcon name="musicNote" size={20} />
        </div>
      )}
      <div className="d-flex flex-column min-w-0 flex-grow-1">
        <span className={`fw-semibold text-truncate ${playing ? 'text-primary' : ''}`}>
          {track.title}
        </span>
        <span className="text-secondary small text-truncate">
          {track.artist?.name ?? 'Desconocido'}
          {track.album?.title ? ` · ${track.album.title}` : ''}
          {track.genre?.name ? ` · ${track.genre.name}` : ''}
        </span>
      </div>
      <span className="small text-secondary text-nowrap">
        {formatDuration(track.duration)}
      </span>
      <button
        type="button"
        className={`btn btn-sm btn-icon rounded-circle d-flex align-items-center justify-content-center ${playing ? 'btn-primary' : 'btn-outline-secondary'}`}
        onClick={() => onPlay(indexInList)}
        aria-label={playing ? 'Pausar' : 'Reproducir'}
      >
        <PlayerIcon name={playing ? 'pause' : 'play'} size={20} />
      </button>
    </li>
  );
}

export default function Biblioteca() {
  useFeather();
  const { currentTrack, isPlaying, playQueue } = usePlayer();
  const [query, setQuery] = useState('');
  const [genreId, setGenreId] = useState('');
  const [tracks, setTracks] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadTracks = useCallback(async () => {
    setLoading(true);
    setError('');
    const params = {
      fields: ['id', 'title', 'duration', 'audio_url', 'cover', 'release_date'],
      populate: {
        artist: { fields: ['name'] },
        album: { fields: ['title'] },
        genre: { fields: ['name'] },
      },
      pagination: { pageSize: 50 },
      sort: ['title:asc'],
    };

    const q = query.trim();
    const filters = {};
    if (q) {
      filters.$or = [
        { title: { $contains: q } },
        { artist: { name: { $contains: q } } },
      ];
    }
    if (genreId) {
      filters.genre = { id: { $eq: Number(genreId) } };
    }
    if (Object.keys(filters).length) {
      params.filters = filters;
    }

    try {
      const { data } = await strapiClient.get('/tracks', { params });
      setTracks(data.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [query, genreId]);

  useEffect(() => {
    let active = true;
    strapiClient
      .get('/genres', {
        params: {
          fields: ['id', 'name'],
          pagination: { pageSize: 50 },
          sort: ['name:asc'],
        },
      })
      .then(({ data }) => {
        if (active) setGenres(data.data);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();
    loadTracks();
  };

  const handlePlay = (index) => {
    playQueue(tracks, index);
  };

  return (
    <div className="row g-4">
      <div className="col-12">
        <div className="card">
          <div className="card-header">
            <h1 className="card-title h5 mb-0">
              <i data-feather="disc" className="align-middle me-1"></i>
              Biblioteca de música
            </h1>
          </div>
          <div className="card-body">
            {error && (
              <div className="alert alert-danger py-2" role="alert">
                {error}
              </div>
            )}

            <form className="row g-2 mb-3" onSubmit={handleSearch}>
              <div className="col-12 col-md-7">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Buscar por canción o artista…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <div className="col-12 col-md-3">
                <select
                  className="form-select"
                  value={genreId}
                  onChange={(e) => setGenreId(e.target.value)}
                >
                  <option value="">Todos los géneros</option>
                  {genres.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-12 col-md-2">
                <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                  {loading ? 'Buscando…' : 'Buscar'}
                </button>
              </div>
            </form>

            {tracks.length > 0 ? (
              <ul className="list-group list-group-flush">
                {tracks.map((track, i) => (
                  <TrackRow
                    key={track.id}
                    track={track}
                    indexInList={i}
                    playing={Boolean(currentTrack && currentTrack.id === track.id && isPlaying)}
                    onPlay={handlePlay}
                  />
                ))}
              </ul>
            ) : (
              <p className="text-secondary mb-0">
                {loading
                  ? 'Cargando canciones…'
                  : 'No hay canciones. Asegurate de crear tracks en el Admin UI de Strapi.'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}