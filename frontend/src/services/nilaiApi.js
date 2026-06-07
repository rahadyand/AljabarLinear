import api from '../api/axios';

export const getNilai = () => api.get('/nilai/');
export const getNilaiByMahasiswa = (mahasiswaId) => api.get(`/nilai/${mahasiswaId}`);
export const createNilai = (data) => api.post('/nilai/', data);
export const deleteNilai = (id) => api.delete(`/nilai/${id}`);
