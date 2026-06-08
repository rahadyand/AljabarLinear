import axios from 'axios';

<<<<<<< HEAD
const api = axios.create({
  baseURL: 'http://localhost:8000',
=======
// Gunakan env variable, fallback ke localhost untuk development
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: baseURL,
>>>>>>> phase-b-update
  headers: { 'Content-Type': 'application/json' },
});

export default api;
