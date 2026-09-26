import axios from 'axios';

const strapiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:1337/api',
  timeout: 15000,
});

strapiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('comunidad_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const isAuthUrl = (url) => url?.includes('/auth/');

strapiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const hasToken = Boolean(localStorage.getItem('comunidad_token'));
    if (status === 401 && hasToken && !isAuthUrl(error?.config?.url)) {
      localStorage.removeItem('comunidad_token');
      localStorage.removeItem('comunidad_user');
      window.location.assign('/login');
    }
    return Promise.reject(error);
  },
);

export function getErrorMessage(error) {
  return (
    error?.response?.data?.error?.message ||
    error?.message ||
    'Ocurrió un error inesperado'
  );
}

export { strapiClient };
export default strapiClient;