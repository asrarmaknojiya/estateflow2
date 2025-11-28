import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4500/',
});

// attach tokens
api.interceptors.request.use((config) => {
  const access = localStorage.getItem('accessToken');
  const refresh = localStorage.getItem('refreshToken');

  if (access) config.headers.Authorization = `Bearer ${access}`;
  if (refresh) config.headers['x-refresh-token'] = refresh;

  return config;
});

// response interceptor attempts refresh on 401
api.interceptors.response.use(
  res => res,
  async (error) => {
    const originalRequest = error.config;
    if (!originalRequest) return Promise.reject(error);

    // only try once
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          localStorage.clear();
          window.location.href = '/admin/login';
          return Promise.reject(error);
        }

        const r = await axios.post('http://localhost:4500/refresh-token', { refreshToken });

        localStorage.setItem('accessToken', r.data.accessToken);
        // set new access token in original request and retry
        originalRequest.headers.Authorization = `Bearer ${r.data.accessToken}`;
        return api(originalRequest);
      } catch (e) {
        // refresh failed => force logout on client
        localStorage.clear();
        window.location.href = '/admin/login';
        return Promise.reject(e);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
