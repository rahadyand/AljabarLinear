import api from '../api/axios';

export const getMahasiswa = () => api.get('/mahasiswa/');
export const createMahasiswa = (data) => api.post('/mahasiswa/', data);
