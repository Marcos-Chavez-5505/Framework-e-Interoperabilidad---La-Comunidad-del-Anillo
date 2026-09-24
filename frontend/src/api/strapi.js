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

export function getErrorMessage(error) {
  return (
    error?.response?.data?.error?.message ||
    error?.message ||
    'Ocurrió un error inesperado'
  );
}

export { strapiClient };
export default strapiClient;