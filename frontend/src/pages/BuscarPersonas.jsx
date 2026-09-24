import { useEffect, useState } from 'react';
import { useAuth } from '../auth/useAuth';
import { getErrorMessage, strapiClient } from '../api/strapi';
import useFeather from '../hooks/useFeather';

function loadFollowsMap(viewerId) {
  return strapiClient
    .get('/follows', {
      params: {
        fields: ['id', 'documentId'],
        pagination: { pageSize: 100 },
        filters: { follower: { id: { $eq: viewerId } } },
        populate: { following: { fields: ['id'] } },
      },
    })
    .then(({ data }) => {
      const map = {};
      data.data.forEach((follow) => {
        if (follow.following?.id != null) {
          map[follow.following.id] = follow.documentId;
        }
      });
      return map;
    });
}

function UserRow({ persona, isFollowing, onFollow, onUnfollow, busy, viewerId }) {
  if (persona.id === viewerId) return null;

  return (
    <li className="list-group-item d-flex align-items-center gap-3">
      {persona.avatar ? (
        <img
          src={persona.avatar}
          alt={persona.username}
          className="avatar rounded-circle"
        />
      ) : (
        <div
          className="avatar rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
          style={{ fontSize: '1rem' }}
        >
          {String(persona.username ?? '?').charAt(0).toUpperCase()}
        </div>
      )}
      <div className="d-flex flex-column min-w-0 flex-grow-1">
        <span className="fw-semibold text-truncate">{persona.username}</span>
        <span className="text-secondary small text-truncate">
          {persona.bio || 'Sin bio'}
        </span>
      </div>
      {isFollowing ? (
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={() => onUnfollow(persona)}
          disabled={busy}
        >
          Dejar de seguir
        </button>
      ) : (
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => onFollow(persona)}
          disabled={busy}
        >
          Seguir
        </button>
      )}
    </li>
  );
}

export default function BuscarPersonas() {
  useFeather();
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [follows, setFollows] = useState({});
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user?.id) return;
    let active = true;
    loadFollowsMap(user.id)
      .then((map) => {
        if (active) setFollows(map);
      })
      .catch((err) => {
        if (active) setError(getErrorMessage(err));
      });
    return () => {
      active = false;
    };
  }, [user?.id]);

  const handleSearch = async (event) => {
    event.preventDefault();
    setError('');
    const q = query.trim();
    if (!q) return;
    setLoading(true);
    try {
      const { data } = await strapiClient.get('/users', {
        params: {
          fields: ['id', 'username', 'bio', 'avatar'],
          pagination: { pageSize: 20 },
          filters: { username: { $contains: q } },
        },
      });
      setResults(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (persona) => {
    setBusy(true);
    setError('');
    try {
      await strapiClient.post('/follows', { data: { following: persona.id } });
      const map = await loadFollowsMap(user?.id);
      setFollows(map);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const handleUnfollow = async (persona) => {
    const followId = follows[persona.id];
    if (!followId) return;
    setBusy(true);
    setError('');
    try {
      await strapiClient.delete(`/follows/${followId}`);
      const map = await loadFollowsMap(user?.id);
      setFollows(map);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const resultRows = results
    .filter((persona) => persona.id !== user?.id)
    .map((persona) => (
      <UserRow
        key={persona.id}
        persona={persona}
        viewerId={user?.id}
        isFollowing={Boolean(follows[persona.id])}
        onFollow={handleFollow}
        onUnfollow={handleUnfollow}
        busy={busy}
      />
    ));

  return (
    <div className="row">
      <div className="col-12 col-lg-8">
        <div className="card">
          <div className="card-header">
            <h1 className="card-title h5 mb-0">
              <i data-feather="users" className="align-middle me-1"></i>
              Buscar personas
            </h1>
          </div>
          <div className="card-body">
            {error && (
              <div className="alert alert-danger py-2" role="alert">
                {error}
              </div>
            )}

            <form className="input-group mb-3" onSubmit={handleSearch}>
              <input
                type="text"
                className="form-control"
                placeholder="Buscar por nombre de usuario…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                required
              />
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Buscando…' : 'Buscar'}
              </button>
            </form>

            {results.length > 0 ? (
              <ul className="list-group list-group-flush">
                {resultRows.length > 0 ? (
                  resultRows
                ) : (
                  <li className="list-group-item text-secondary">
                    Solo se muestran resultados de otras personas.
                  </li>
                )}
              </ul>
            ) : (
              <p className="text-secondary mb-0">
                Buscá por nombre de usuario para encontrar personas y seguirlas.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}