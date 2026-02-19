import { Server } from 'socket.io';
import { getOrCreateConversation, saveChatMessage } from '../app/api/_services/chatService.js';

let io = null;

// Store connected users
const connectedUsers = new Map();

export function initSocketServer(httpServer) {
  if (io) {
    return io;
  }

  io = new Server(httpServer, {
    path: '/api/socket',
    addTrailingSlash: false,
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log('🔌 Client connected:', socket.id);

    const { userId, userRole } = socket.handshake.auth;

    if (userId) {
      connectedUsers.set(userId, { socketId: socket.id, userRole });
      console.log(`👤 User ${userId} (${userRole}) connected`);
      
      // Notify all admins when a customer connects
      if (userRole === 'customer') {
        io.emit('user:online', { userId, userRole });
      }
    }

    // Handle authentication
    socket.on('auth:register', (data) => {
      const { userId, userRole } = data;
      connectedUsers.set(userId, { socketId: socket.id, userRole });
      socket.userId = userId;
      socket.userRole = userRole;
      
      console.log(`✅ User authenticated: ${userId} (${userRole})`);
      socket.emit('auth:success', { userId, userRole });
      
      // Notify admins if a customer connects
      if (userRole === 'customer') {
        io.emit('user:online', { userId, userRole });
      }
    });

    // Handle chat messages
    socket.on('chat:message', async (data) => {
      console.log('💬 Message received:', data);
      const { to, from, message, timestamp } = data;

      try {
        // Save message to database
        let conversationId;
        let receiverId = null;

        if (to === 'admin') {
          // Customer sending to admin
          const conversation = await getOrCreateConversation(from);
          conversationId = conversation.id;
          console.log('📦 Conversation ID:', conversationId);

          // Save message
          await saveChatMessage({
            conversationId,
            senderId: from,
            receiverId: null, // Admin messages have no specific receiver
            message,
          });

          // Broadcast to all connected admins
          console.log('📤 Broadcasting to all admins from customer:', from);
          connectedUsers.forEach((userData, userId) => {
            if (userData.userRole === 'admin') {
              io.to(userData.socketId).emit('chat:message', {
                from,
                to: 'admin',
                message,
                timestamp,
                conversationId,
              });
              console.log('✅ Sent to admin:', userId);
            }
          });
        } else {
          // Admin replying to customer
          const conversation = await getOrCreateConversation(to);
          conversationId = conversation.id;
          receiverId = to;

          // Save message
          await saveChatMessage({
            conversationId,
            senderId: from,
            receiverId: to,
            message,
          });

          // Send to specific user
          const recipient = connectedUsers.get(to);
          if (recipient) {
            console.log('📤 Sending message to:', to);
            io.to(recipient.socketId).emit('chat:message', {
              from,
              to,
              message,
              timestamp,
              conversationId,
            });
            console.log('✅ Message delivered to:', to);
          } else {
            console.log('⚠️ Recipient not found:', to);
          }
        }

        // Acknowledge message sent
        socket.emit('chat:sent', {
          to,
          message,
          timestamp,
          conversationId,
          success: true,
        });
      } catch (error) {
        console.error('❌ Error handling chat message:', error);
        socket.emit('chat:error', {
          message: 'Failed to send message',
          error: error.message,
        });
      }
    });

    // Handle typing indicator
    socket.on('chat:typing', (data) => {
      const { to, isTyping } = data;
      const recipient = connectedUsers.get(to);
      
      if (recipient) {
        io.to(recipient.socketId).emit('chat:typing', {
          from: socket.userId,
          isTyping,
        });
      }
    });

    // Handle user disconnect
    socket.on('disconnect', (reason) => {
      console.log('🔌 Client disconnected:', socket.id, 'Reason:', reason);
      
      if (socket.userId) {
        connectedUsers.delete(socket.userId);
        console.log(`👤 User ${socket.userId} disconnected`);
        
        // Notify all users about offline status
        io.emit('user:offline', { userId: socket.userId });
      }
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  console.log('✅ Socket.IO server initialized');
  return io;
}

export function getIO() {
  if (!io) {
    throw new Error('Socket.IO server not initialized');
  }
  return io;
}

export function getConnectedUsers() {
  return Array.from(connectedUsers.entries()).map(([userId, data]) => ({
    userId,
    ...data,
  }));
}
