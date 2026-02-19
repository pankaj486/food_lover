import { io } from 'socket.io-client';
import { getSocketUrl, getSocketPath, getSocketOptions } from './socketConfig';

let socket = null;

export const getSocket = (customOptions = {}) => {
  if (!socket) {
    const options = getSocketOptions(customOptions);
    
    socket = io(getSocketUrl(), {
      path: getSocketPath(),
      ...options,
    });

    socket.on('connect', () => {
      console.log('✅ WebSocket connected:', socket.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason);
    });

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });
  }

  return socket;
};

export const connectSocket = (userId, userRole, customOptions = {}) => {
  const socket = getSocket(customOptions);
  
  if (!socket.connected) {
    socket.auth = { userId, userRole };
    socket.connect();
  }
  
  return socket;
};


export const disconnectSocket = () => {
  if (socket && socket.connected) {
    socket.disconnect();
  }
};


export const isConnected = () => {
  return socket && socket.connected;
};


export const getSocketId = () => {
  return socket?.id || null;
};


export const emit = (event, data) => {
  if (socket && socket.connected) {
    socket.emit(event, data);
    return true;
  }
  console.warn(`Cannot emit ${event}: Socket not connected`);
  return false;
};


export const on = (event, callback) => {
  if (socket) {
    socket.on(event, callback);
    return () => socket.off(event, callback);
  }
  return () => {};
};

export const off = (event, callback) => {
  if (socket) {
    socket.off(event, callback);
  }
};


export const removeAllListeners = (event) => {
  if (socket) {
    socket.removeAllListeners(event);
  }
};
