import { io } from 'socket.io-client';
import { Item, Folder } from '../types';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

const socket = io(SOCKET_URL);

type SocketCallback = {
  onItemCreate?: (item: Item) => void;
  onItemUpdate?: (item: Item) => void;
  onItemDelete?: (id: string) => void;
  onFolderCreate?: (folder: Folder) => void;
  onFolderUpdate?: (folder: Folder) => void;
  onFolderDelete?: (id: string) => void;
  onReorder?: (data: any) => void;
};

export const initSocket = (callbacks: SocketCallback) => {
  socket.on('connect', () => {
    console.log('Connected to server');
  });

  socket.on('disconnect', () => {
    console.log('Disconnected from server');
  });

  socket.on('item:create', (item: Item) => {
    if (callbacks.onItemCreate) {
      callbacks.onItemCreate(item);
    }
  });

  socket.on('item:update', (item: Item) => {
    if (callbacks.onItemUpdate) {
      callbacks.onItemUpdate(item);
    }
  });

  socket.on('item:delete', (id: string) => {
    if (callbacks.onItemDelete) {
      callbacks.onItemDelete(id);
    }
  });

  socket.on('folder:create', (folder: Folder) => {
    if (callbacks.onFolderCreate) {
      callbacks.onFolderCreate(folder);
    }
  });

  socket.on('folder:update', (folder: Folder) => {
    if (callbacks.onFolderUpdate) {
      callbacks.onFolderUpdate(folder);
    }
  });

  socket.on('folder:delete', (id: string) => {
    if (callbacks.onFolderDelete) {
      callbacks.onFolderDelete(id);
    }
  });

  socket.on('reorder', (data: any) => {
    if (callbacks.onReorder) {
      callbacks.onReorder(data);
    }
  });

  return () => {
    socket.off('item:create');
    socket.off('item:update');
    socket.off('item:delete');
    socket.off('folder:create');
    socket.off('folder:update');
    socket.off('folder:delete');
    socket.off('reorder');
  };
};

export default socket; 