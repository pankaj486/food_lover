import { useEffect, useState, useCallback, useRef } from 'react';
import { connectSocket, disconnectSocket } from './socket';

export const useSocket = (userId, userRole) => {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!userId) return;

    // Connect to socket
    socketRef.current = connectSocket(userId, userRole);
    const socket = socketRef.current;

    // Connection handlers
    const handleConnect = () => {
      setIsConnected(true);
      console.log('✅ Connected to WebSocket');
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      console.log('❌ Disconnected from WebSocket');
    };

    const handleAuthSuccess = (data) => {
      console.log('✅ Authentication successful:', data);
    };

    // Message handlers
    const handleChatMessage = (data) => {
      console.log('📨 Received message:', data);
      setMessages((prev) => [...prev, {
        id: `${data.from}-${Date.now()}`,
        from: data.from,
        to: data.to,
        message: data.message,
        timestamp: data.timestamp,
        type: 'received',
      }]);
    };

    // Just acknowledge sent (message already added optimistically)
    const handleChatSent = (data) => {
      console.log('✅ Message sent confirmation:', data);
    };

    // User status handlers
    const handleUserOnline = (data) => {
      setOnlineUsers((prev) => [...prev.filter(u => u.userId !== data.userId), data]);
      console.log('👤 User online:', data.userId);
    };

    const handleUserOffline = (data) => {
      setOnlineUsers((prev) => prev.filter(u => u.userId !== data.userId));
      console.log('👤 User offline:', data.userId);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('auth:success', handleAuthSuccess);
    socket.on('chat:message', handleChatMessage);
    socket.on('chat:sent', handleChatSent);
    socket.on('user:online', handleUserOnline);
    socket.on('user:offline', handleUserOffline);

    // Cleanup
    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('auth:success', handleAuthSuccess);
      socket.off('chat:message', handleChatMessage);
      socket.off('chat:sent', handleChatSent);
      socket.off('user:online', handleUserOnline);
      socket.off('user:offline', handleUserOffline);
      disconnectSocket();
    };
  }, [userId, userRole]);

  const sendMessage = useCallback((to, message) => {
    if (!socketRef.current || !socketRef.current.connected) {
      console.error('Socket not connected');
      return;
    }

    const timestamp = new Date().toISOString();
    
    // Add message optimistically to UI
    setMessages((prev) => [...prev, {
      id: `${userId}-${Date.now()}`,
      from: userId,
      to,
      message,
      timestamp,
      type: 'sent',
    }]);

    // Send to server
    socketRef.current.emit('chat:message', {
      to,
      from: userId,
      message,
      timestamp,
    });
  }, [userId]);

  const sendTypingIndicator = useCallback((to, isTyping) => {
    if (!socketRef.current || !socketRef.current.connected) return;

    socketRef.current.emit('chat:typing', {
      to,
      isTyping,
    });
  }, []);

  return {
    isConnected,
    messages,
    onlineUsers,
    sendMessage,
    sendTypingIndicator,
    socket: socketRef.current,
  };
};
