import api from '../api/axios';

export const uploadCsv = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/upload/csv', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
