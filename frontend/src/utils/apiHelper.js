import axios from 'axios';
import { Config } from '../config';
export const API_URL = Config.API_URL;

const axiosApi = axios.create({
  baseURL: API_URL,
});

axiosApi.defaults.headers.common['Authorization'] = localStorage.getItem('access_token');

axiosApi.interceptors.response.use(
  (response) => response,
  // error => Promise.reject(error)
  (error) => {
    console.log('error: ', error);
    const { response } = error;

    if (response && response.status === 401) {
      // Handle unauthorized access, for example, navigate to the login page
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export async function apiGET(url, config = {}) {
  const accessToken = localStorage.getItem('access_token');
  axiosApi.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
  return await axiosApi
    .get(url, { ...config })
    .then((response) => response)
    .catch((error) => error.response);
}
export async function apiPOST(url, data, config = {}) {
  const accessToken = localStorage.getItem('access_token');
  axiosApi.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
  return axiosApi
    .post(url, data, { ...config })
    .then((response) => response)
    .catch((error) => error.response);
}

export async function apiPUT(url, data, config = {}) {
  const accessToken = localStorage.getItem('access_token');
  axiosApi.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
  return axiosApi
    .put(url, { ...data }, { ...config })
    .then((response) => response)
    .catch((error) => error.response);
}

export async function apiDELETE(url, config = {}) {
  const accessToken = localStorage.getItem('access_token');
  axiosApi.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
  return await axiosApi
    .delete(url, { ...config })
    .then((response) => response)
    .catch((error) => error.response);
}
