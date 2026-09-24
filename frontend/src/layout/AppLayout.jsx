import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import useFeather from '../hooks/useFeather';

export default function AppLayout() {
  useFeather();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const navLinkClass = ({ isActive }) =>
    `nav-link ${isActive ? 'active' : ''}`;

  return (
    <div className="wrapper">
      <aside id="sidebar" className="sidebar break-point-lg has-bg-image">
        <div id="sidebar-nav" className="sidebar-header">
          <div className="d-flex justify-content-between align-items-center">
            <Link to="/" className="d-flex align-items-center gap-2 text-decoration-none">
              <div className="rounded-circle p-1 bg-primary">
                <i className="align-middle text-white" data-feather="music"></i>
              </div>
              <div className="ms-1 text-white fs-6 fw-semibold">
                La Comunidad del Anillo
              </div>
            </Link>
            <button
              type="button"
              className="btn btn-secondary rounded-circle btn-close-sidebar"
              data-ignore="true"
              aria-label="Cerrar panel"
            >
              <i data-feather="x" className="align-middle"></i>
            </button>
          </div>
        </div>

        <div className="sidebar-body px-3 pt-2">
          <div className="nav-item py-2">
            <Link to="/perfil" className="nav-link d-flex align-items-center gap-3">
              <div className="avatar">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.username} />
                ) : (
                  <div className="avatar-sm bg-primary text-white d-flex align-items-center justify-content-center">
                    <i data-feather="user" className="align-middle"></i>
                  </div>
                )}
              </div>
              <div className="d-flex flex-column">
                <span className="fs-7 overflow-hidden text-nowrap">{user?.username}</span>
                <span className="fs-8 text-secondary">Mi perfil</span>
              </div>
            </Link>
          </div>

          <nav className="nav nav-vertical">
            <NavLink to="/" end className={navLinkClass}>
              <i data-feather="home" className="align-middle me-2"></i>
              <span>Inicio</span>
            </NavLink>
            <NavLink to="/personas" className={navLinkClass}>
              <i data-feather="users" className="align-middle me-2"></i>
              <span>Buscar personas</span>
            </NavLink>
            <NavLink to="/perfil" className={navLinkClass}>
              <i data-feather="user" className="align-middle me-2"></i>
              <span>Mi perfil</span>
            </NavLink>
            <span className="nav-link disabled">
              <i data-feather="disc" className="align-middle me-2"></i>
              <span>Mis playlist (próximamente)</span>
            </span>
          </nav>
        </div>
      </aside>

      <div className="main">
        <nav className="navbar navbar-expand navbar-light navbar-bg">
          <button
            type="button"
            className="btn btn-primary rounded-circle btn-open-sidebar"
            data-ignore="true"
            aria-label="Abrir panel"
          >
            <i data-feather="menu" className="align-middle"></i>
          </button>

          <div className="navbar-collapse collapse d-flex justify-content-end">
            <div className="dropdown me-3">
              <button
                type="button"
                className="btn btn-secondary dropdown-toggle"
                data-bs-toggle="dropdown"
                data-bs-display="static"
                aria-expanded="false"
              >
                <i data-feather="user" className="align-middle me-1"></i>
                <span className="align-middle">{user?.username}</span>
              </button>
              <ul className="dropdown-menu">
                <li>
                  <Link to="/perfil" className="dropdown-item">
                    <i data-feather="user" className="align-middle me-2"></i>
                    Mi perfil
                  </Link>
                </li>
                <li>
                  <button type="button" className="dropdown-item text-danger" onClick={handleLogout}>
                    <i data-feather="log-out" className="align-middle me-2"></i>
                    Cerrar sesión
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </nav>

        <main className="content">
          <div className="container-fluid p-4">
            <Outlet />
          </div>
        </main>

        <footer className="footer">
          <div className="container-fluid">
            <div className="row text-muted">
              <div className="col-6 text-start">
                <p className="mb-0">
                  <a href="#" className="text-muted">
                    <strong>La Comunidad del Anillo</strong>
                  </a>
                </p>
              </div>
              <div className="col-6 text-end">
                <ul className="list-inline">
                  <li className="list-inline-item">
                    <span className="text-muted">TP2 · Strapi + React + AdminKit</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}