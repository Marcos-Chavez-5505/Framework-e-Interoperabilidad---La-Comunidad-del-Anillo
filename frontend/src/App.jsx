import { Navigate, Route, Routes } from 'react-router-dom';
import AuthProvider from './auth/AuthProvider';
import PlayerProvider from './player/PlayerProvider';
import PrivateRoute from './auth/PrivateRoute';
import AppLayout from './layout/AppLayout';
import Inicio from './pages/Inicio';
import Login from './pages/Login';
import Register from './pages/Register';
import Perfil from './pages/Perfil';
import BuscarPersonas from './pages/BuscarPersonas';
import Biblioteca from './pages/Biblioteca';

export default function App() {
  return (
    <AuthProvider>
      <PlayerProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<PrivateRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Inicio />} />
              <Route path="/musica" element={<Biblioteca />} />
              <Route path="/personas" element={<BuscarPersonas />} />
              <Route path="/perfil" element={<Perfil />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </PlayerProvider>
    </AuthProvider>
  );
}