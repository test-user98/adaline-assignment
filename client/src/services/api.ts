import axios, { AxiosError } from 'axios';
import { Item, Folder } from '../types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 sec timeout
});

// Add response interceptor for error handling
api.interceptors.response.use(
  response => response,
  (error: AxiosError) => {
    console.error('API Error:', error.message, error.response?.data);
    
    if (error.response) {
      error.message = `Server error: ${error.response.status} - ${error.message}`;
    } else if (error.request) {
      error.message = 'No response received from server. okease ceck the coinnection';
    }
    
    return Promise.reject(error);
  }
);

export const fetchData = async () => {
  try {
    const response = await api.get('/data');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch data:', error);
    throw error;
  }
};

export const createItem = async (item: Partial<Item>) => {
  try {
    const response = await api.post('/items', item);
    return response.data;
  } catch (error) {
    console.error('Failed to create item:', error);
    throw error;
  }
};

export const updateItem = async (id: string, item: Partial<Item>) => {
  try {
    const response = await api.put(`/items/${id}`, item);
    return response.data;
  } catch (error) {
    console.error(`Failed to update item ${id}:`, error);
    throw error;
  }
};

export const deleteItem = async (id: string) => {
  try {
    await api.delete(`/items/${id}`);
    return id;
  } catch (error) {
    console.error(`Failed to delete item ${id}:`, error);
    throw error;
  }
};

export const createFolder = async (folder: Partial<Folder>) => {
  try {
    const response = await api.post('/folders', folder);
    return response.data;
  } catch (error) {
    console.error('Failed to create folder:', error);
    throw error;
  }
};

export const updateFolder = async (id: string, folder: Partial<Folder>) => {
  try {
    const response = await api.put(`/folders/${id}`, folder);
    return response.data;
  } catch (error) {
    console.error(`Failed to update folder ${id}:`, error);
    throw error;
  }
};

export const deleteFolder = async (id: string) => {
  try {
    await api.delete(`/folders/${id}`);
    return id;
  } catch (error) {
    console.error(`Failed to delete folder ${id}:`, error);
    throw error;
  }
};

// Define reordering interfaces
export interface ReorderItemData {
  id: string;
  order: number;
  folderId: string | null;
}

export interface ReorderFolderData {
  id: string;
  order: number;
}

export interface ReorderData {
  items?: ReorderItemData[];
  folders?: ReorderFolderData[];
}

export const reorderItems = async (data: ReorderData) => {
  try {
    const response = await api.put('/reorder', data);
    return response.data;
  } catch (error) {
    console.error('Failed to reorder items/folders:', error);
    throw error;
  }
};

export default api; 