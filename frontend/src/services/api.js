import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

export const getItems = (offset = 0, limit = 20, filter = '', selected = false) => {
  return api.get('/items', {
    params: { offset, limit, filter, selected },
  });
};

export const getSelection = () => {
  return api.get('/selection');
};

export const updateSelection = (selected, sortOrder) => {
  return api.post('/selection', { selected, sortOrder });
};

export const addNewItems = (ids) => {
  return api.post('/items/batch-add', { ids });
};