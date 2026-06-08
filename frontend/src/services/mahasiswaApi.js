import api from '../api/axios';

export const getMahasiswa = () => api.get('/mahasiswa/');
export const createMahasiswa = (data) => api.post('/mahasiswa/', data);
<<<<<<< HEAD
=======
export const deleteMahasiswa = (id) => api.delete(`/mahasiswa/${id}`);
>>>>>>> phase-b-update
