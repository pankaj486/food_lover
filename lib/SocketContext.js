/**
 * Socket Context Provider
 * Provides WebSocket functionality to the entire app via React Context
 * This makes socket features available without prop drilling
 */

'use client';

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { getSocket, connectSocket, disconnectSocket } from './socket';

const SocketContext = createContext(null);

/**
 * Socket Provider Component
 * Wrap your app or specific sections with this provider
 * 
 * @param {string} userId - User ID for authentication
 * @param {string} userRole - User role ('admin' | 'customer')
 * @param {boolean} autoConnect - Whether to connect automatically (default: true)
 */
export function SocketProvider({ userId, userRole, autoConnect = true, children }) {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState(new Map());
  const socketRef = useRef(null);

  useEffect(() => {
    if (!userId || !autoConnect) return;

    // Connect to socket
    socketRef.current = connectSocket(userId, userRole);
    const socket = socketRef.current;

    // Connection handlers
    socket.on('connect', () => {
      setIsConnected(true);
      console.log('✅ Socket Context: Connected');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      console.log('❌ Socket Context: Disconnected');
    });

    socket.on('auth:success', (data) => {
      console.log('✅ Socket Context: Authenticated', data);
    });

    // Message handlers
    socket.on('chat:message', (data) => {
      setMessages((prev) => [...prev, {
        id: `${Date.now()}-${Math.random()}`,
        from: data.from,
        message: data.message,
        timestamp: data.timestamp,
        type: 'received',
      }]);
    });

    socket.on('chat:sent', (data) => {
      setMessages((prev) => [...prev, {
        id: `${Date.now()}-${Math.random()}`,
        to: data.to,
        message: data.message,
        timestamp: data.timestamp,
        type: 'sent',
      }]);
    });

    // Typing handlers
    socket.on('chat:typing', (data) => {
      setTypingUsers((prev) => {
        const newMap = new Map(prev);
        if (data.isTyping) {
          newMap.set(data.from, true);
        } else {
          newMap.delete(data.from);
        }
        return newMap;
      });
    });

    // User status handlers
    socket.on('user:online', (data) => {
      setOnlineUsers((prev) => {
        const filtered = prev.filter(u => u.userId !== data.userId);
        return [...filtered, data];
      });
    });

    socket.on('user:offline', (data) => {
      setOnlineUsers((prev) => prev.filter(u => u.userId !== data.userId));
    });

    // Cleanup
    return () => {
      disconnectSocket();
    };
  }, [userId, userRole, autoConnect]);

  const sendMessage = useCallback((to, message) => {
    if (!socketRef.current || !socketRef.current.connected) {
      console.error('Socket not connected');
      return false;
    }

    socketRef.current.emit('chat:message', {
      to,
      from: userId,
      message,
      timestamp: new Date().toISOString(),
    });
    return true;
  }, [userId]);

  const sendTypingIndicator = useCallback((to, isTyping) => {
    if (!socketRef.current || !socketRef.current.connected) return;

    socketRef.current.emit('chat:typing', {
      to,
      isTyping,
    });
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const isUserTyping = useCallback((userId) => {
    return typingUsers.has(userId);
  }, [typingUsers]);

  const value = {
    isConnected,
    messages,
    onlineUsers,
    sendMessage,
    sendTypingIndicator,
    clearMessages,
    isUserTyping,
    socket: socketRef.current,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}

/**
 * Hook to use Socket Context
 * Must be used within a SocketProvider
 */
export function useSocketContext() {
  const context = useContext(SocketContext);
  
  if (!context) {
    throw new Error('useSocketContext must be used within a SocketProvider');
  }
  
  return context;
}

/**
 * Optional hook that doesn't throw error if outside provider
 * Returns null if not within SocketProvider
 */
export function useSocketContextOptional() {
  return useContext(SocketContext);
}
