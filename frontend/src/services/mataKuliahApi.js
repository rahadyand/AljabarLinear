import api from '../api/axios';

export const getMataKuliah = () => api.get('/mata-kuliah/');
export const createMataKuliah = (data) => api.post('/mata-kuliah/', data);
<<<<<<< HEAD
=======
export const deleteMataKuliah = (id) => api.delete(`/mata-kuliah/${id}`);
>>>>>>> phase-b-update
