/**
 * Socket Utility Functions
 * Reusable helper functions for socket operations
 */

/**
 * Format timestamp for display
 */
export function formatMessageTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString();
}

/**
 * Format timestamp for message display
 */
export function formatMessageTimestamp(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Group messages by date
 */
export function groupMessagesByDate(messages) {
  const groups = {};
  
  messages.forEach(message => {
    const date = new Date(message.timestamp).toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
  });
  
  return groups;
}

/**
 * Check if user is online
 */
export function isUserOnline(userId, onlineUsers) {
  return onlineUsers.some(user => user.userId === userId);
}

/**
 * Get unread message count
 */
export function getUnreadCount(messages, userId) {
  return messages.filter(msg => 
    msg.from !== userId && !msg.read
  ).length;
}

/**
 * Get unread messages by sender
 */
export function getUnreadMessagesBySender(messages, currentUserId) {
  const unreadMap = new Map();
  
  messages
    .filter(msg => msg.from !== currentUserId && !msg.read)
    .forEach(msg => {
      const count = unreadMap.get(msg.from) || 0;
      unreadMap.set(msg.from, count + 1);
    });
  
  return unreadMap;
}

/**
 * Filter messages by conversation (between two users)
 */
export function getConversationMessages(messages, userId1, userId2) {
  return messages.filter(msg => 
    (msg.from === userId1 && msg.to === userId2) ||
    (msg.from === userId2 && msg.to === userId1)
  ).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
}

/**
 * Get last message in conversation
 */
export function getLastMessage(messages, userId1, userId2) {
  const conversation = getConversationMessages(messages, userId1, userId2);
  return conversation[conversation.length - 1] || null;
}

/**
 * Sanitize message content (basic XSS prevention)
 */
export function sanitizeMessage(message) {
  if (typeof message !== 'string') return '';
  
  return message
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
}

/**
 * Validate message before sending
 */
export function validateMessage(message) {
  if (!message || typeof message !== 'string') {
    return { valid: false, error: 'Message is required' };
  }
  
  const trimmed = message.trim();
  
  if (trimmed.length === 0) {
    return { valid: false, error: 'Message cannot be empty' };
  }
  
  if (trimmed.length > 5000) {
    return { valid: false, error: 'Message is too long (max 5000 characters)' };
  }
  
  return { valid: true, message: trimmed };
}

/**
 * Generate unique message ID
 */
export function generateMessageId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Check if socket is connected
 */
export function isSocketConnected(socket) {
  return socket && socket.connected === true;
}

/**
 * Get connection status text
 */
export function getConnectionStatusText(isConnected) {
  return isConnected ? 'Connected' : 'Disconnected';
}

/**
 * Get connection status color
 */
export function getConnectionStatusColor(isConnected) {
  return isConnected ? 'green' : 'red';
}

/**
 * Parse socket error
 */
export function parseSocketError(error) {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  return 'An unknown error occurred';
}

/**
 * Debounce function for typing indicators
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Get user role display name
 */
export function getUserRoleDisplay(role) {
  const roleMap = {
    'admin': 'Admin',
    'customer': 'Customer',
    'support': 'Support',
  };
  return roleMap[role] || role;
}

/**
 * Check if message is from current user
 */
export function isOwnMessage(message, currentUserId) {
  return message.from === currentUserId || message.type === 'sent';
}

/**
 * Get conversation partner ID
 */
export function getConversationPartnerId(message, currentUserId) {
  return message.from === currentUserId ? message.to : message.from;
}
