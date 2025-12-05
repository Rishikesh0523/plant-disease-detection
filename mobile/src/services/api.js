import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

export const getModels = async () => {
  try {
    const response = await api.get('/models');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to fetch models');
  }
};

export const predictImage = async (imageUri, modelName) => {
  try {
    const formData = new FormData();
    
    // Extract filename from URI
    const filename = imageUri.split('/').pop();
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';
    
    formData.append('file', {
      uri: imageUri,
      name: filename,
      type,
    });
    
    const response = await api.post(`/predict?model_name=${modelName}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to predict image');
  }
};

export const checkHealth = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    throw new Error('Backend server is not reachable');
  }
};

export default api;
