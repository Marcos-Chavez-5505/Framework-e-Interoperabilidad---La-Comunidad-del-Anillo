import { useState } from 'react';
import { useAuth } from '../auth/useAuth';
import { getErrorMessage, strapiClient } from '../api/strapi';
import useFeather from '../hooks/useFeather';

export default function Perfil() {
  useFeather();
  const { user, refreshUser } = useAuth();
  const [username, setUsername] = useState(user?.username ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [avatar, setAvatar] = useState(user?.avatar ?? '');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');
    setSaving(true);
    try {
      const { data } = await strapiClient.put('/user/me', { username, bio, avatar });
      await refreshUser();
      setUsername(data.username ?? username);
      setBio(data.bio ?? '');
      setAvatar(data.avatar ?? '');
      setMessage('Perfil actualizado correctamente.');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="row g-4">
      <div className="col-12 col-lg-4">
        <div className="card">
          <div className="card-body text-center">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.username}
                className="avatar avatar-xl rounded-circle mb-3"
              />
            ) : (
              <div
                className="avatar avatar-xl rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mx-auto mb-3"
                style={{ fontSize: '2rem' }}
              >
                {(user?.username ?? '?').charAt(0).toUpperCase()}
              </div>
            )}
            <h1 className="h5 mb-1">{user?.username}</h1>
            <p className="text-secondary mb-1">{user?.email}</p>
            {user?.bio && <p className="mb-0 text-muted">{user.bio}</p>}
          </div>
        </div>
      </div>

      <div className="col-12 col-lg-8">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title h5 mb-0">
              <i data-feather="edit" className="align-middle me-1"></i>
              Editar perfil
            </h2>
          </div>
          <div className="card-body">
            {message && (
              <div className="alert alert-success py-2" role="alert">
                {message}
              </div>
            )}
            {error && (
              <div className="alert alert-danger py-2" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label" htmlFor="perfil-username">
                  Nombre de usuario
                </label>
                <input
                  id="perfil-username"
                  type="text"
                  className="form-control"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
                <div className="form-text">Debe ser único.</div>
              </div>
              <div className="mb-3">
                <label className="form-label" htmlFor="perfil-bio">
                  Bio
                </label>
                <textarea
                  id="perfil-bio"
                  className="form-control"
                  rows="3"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Contá quién sos…"
                />
              </div>
              <div className="mb-3">
                <label className="form-label" htmlFor="perfil-avatar">
                  URL del avatar
                </label>
                <input
                  id="perfil-avatar"
                  type="url"
                  className="form-control"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  placeholder="https://…"
                />
                <div className="form-text">Se guarda como texto (URL).</div>
              </div>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Guardando…' : 'Guardar cambios'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}