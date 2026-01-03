// api.js
import axios from "axios";

const API_ROOT = "http://localhost:5000/api";

const client = axios.create({
  baseURL: API_ROOT,
  withCredentials: true // 🔴 REQUIRED FOR REFRESH TOKEN
});

// Set / remove access token
export function setAuthToken(token) {
  if (token) {
    client.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${token}`;
  } else {
    delete client.defaults.headers.common["Authorization"];
  }
}

export default client;
