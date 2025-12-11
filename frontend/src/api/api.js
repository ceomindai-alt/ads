// api.js
import axios from 'axios';

const API_ROOT = 'https://ads-2quj.onrender.com/api/';   // add /api/

const client = axios.create({ baseURL: API_ROOT });

export function setAuthToken(token) {
  if (token) client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  else delete client.defaults.headers.common['Authorization'];
}

export default client;
