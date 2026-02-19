/**
 * Socket Module Index
 * Central export for all socket-related functionality
 * Import everything you need from one place
 */

// Core socket client
export {
  getSocket,
  connectSocket,
  disconnectSocket,
  isConnected,
  getSocketId,
  emit,
  on,
  off,
  removeAllListeners,
} from './socket';

// React hooks
export { useSocket } from './useSocket';

// Context provider
export {
  SocketProvider,
  useSocketContext,
  useSocketContextOptional,
} from './SocketContext';

// Configuration
export {
  SOCKET_CONFIG,
  getSocketUrl,
  getSocketPath,
  getSocketOptions,
  getEventName,
  isValidRole,
  getRole,
} from './socketConfig';

// Utilities
export {
  formatMessageTime,
  formatMessageTimestamp,
  groupMessagesByDate,
  isUserOnline,
  getUnreadCount,
  getUnreadMessagesBySender,
  getConversationMessages,
  getLastMessage,
  sanitizeMessage,
  validateMessage,
  generateMessageId,
  isSocketConnected,
  getConnectionStatusText,
  getConnectionStatusColor,
  parseSocketError,
  debounce,
  getUserRoleDisplay,
  isOwnMessage,
  getConversationPartnerId,
} from './socketUtils';
