import axios from 'axios';
import store from '../redux/store';

const client = axios.create({ baseURL: import.meta.env.VITE_PROXY_URL });


const refreshToken = async () => {
  try {
    const state = store.getState();
    const refreshToken = state.user.refreshToken;
    const response = await axios.post(`${import.meta.env.VITE_PROXY_URL}/refresh-token`, { refreshToken });
    const { accessToken } = response.data;
    
    store.dispatch({ type: 'UPDATE_ACCESS_TOKEN', payload: accessToken });
    
    return accessToken;
  } catch (error) {
    store.dispatch({ type: 'LOGOUT' });
    throw error;
  }
};

// Axios interceptor to handle token expiration
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error?.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const newToken = await refreshToken();
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        return client(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export const publicRequest = ({ ...options }) => {
  const onSuccess = (response: any) => response;
  const onError = (error: any) => error;
  return client(options).then(onSuccess).catch(onError);
};

export const userRequest = ({ ...options }) => {
  const state = store.getState();
  const token = state.user.accessToken;
  client.defaults.headers.common.Authorization = `Bearer ${token}`;
  const onSuccess = (response: any) => response;
  const onError = (error: any) => error;
  return client(options).then(onSuccess).catch(onError);
};