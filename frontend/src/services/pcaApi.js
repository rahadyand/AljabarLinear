import api from '../api/axios';

export const runPca = () => api.post('/analisis/pca');
