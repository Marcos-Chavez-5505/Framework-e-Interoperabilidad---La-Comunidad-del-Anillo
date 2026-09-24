import { Link } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import useFeather from '../hooks/useFeather';

export default function Inicio() {
  useFeather();
  const { user } = useAuth();

  return (
    <div className="row g-4">
      <div className="col-12">
        <div className="card">
          <div className="card-body">
            <h1 className="h4 mb-2">
              ¡Bienvenido de nuevo, {user?.username}!
            </h1>
            <p className="text-secondary mb-0">
              Esta es la prueba de concepto del TP2: Strapi 5 + React + AdminKit.
            </p>
          </div>
        </div>
      </div>

      <div className="col-12 col-md-6 col-xl-4">
        <div className="card">
          <div className="card-body">
            <div className="d-flex align-items-center gap-3">
              <div className="rounded-circle p-2 bg-primary d-inline-flex">
                <i className="align-middle text-white" data-feather="user"></i>
              </div>
              <div>
                <h2 className="h6 mb-0">Autenticación</h2>
                <p className="text-secondary small mb-0">
                  Registro, login y edición de perfil.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="col-12 col-md-6 col-xl-4">
        <div className="card">
          <div className="card-body">
            <div className="d-flex align-items-center gap-3">
              <div className="rounded-circle p-2 bg-success d-inline-flex">
                <i className="align-middle text-white" data-feather="music"></i>
              </div>
              <div>
                <h2 className="h6 mb-0">Reproductor</h2>
                <p className="text-secondary small mb-0">
                  Canciones, álbumes y reproducción (próximamente).
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="col-12 col-md-6 col-xl-4">
        <div className="card">
          <div className="card-body">
            <div className="d-flex align-items-center gap-3">
              <div className="rounded-circle p-2 bg-warning d-inline-flex">
                <i className="align-middle text-white" data-feather="disc"></i>
              </div>
              <div>
                <h2 className="h6 mb-0">Playlists</h2>
                <p className="text-secondary small mb-0">
                  Personales y colaborativas (próximamente).
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="col-12">
        <div className="card">
          <div className="card-body d-flex flex-wrap gap-2">
            <Link to="/personas" className="btn btn-primary">
              <i data-feather="users" className="align-middle me-1"></i>
              Buscar personas
            </Link>
            <Link to="/perfil" className="btn btn-outline-primary">
              <i data-feather="user" className="align-middle me-1"></i>
              Mi perfil
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}