/**
 * Socket Configuration
 * Centralized configuration for WebSocket/Socket.IO
 */

export const SOCKET_CONFIG = {
  // Server URL
  url: process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000',
  
  // Socket.IO path
  path: '/api/socket',
  
  // Connection options
  options: {
    transports: ['websocket', 'polling'],
    autoConnect: false,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
    timeout: 20000,
  },
  
  // Event names
  events: {
    // Connection events
    CONNECT: 'connect',
    DISCONNECT: 'disconnect',
    CONNECT_ERROR: 'connect_error',
    
    // Auth events
    AUTH_REGISTER: 'auth:register',
    AUTH_SUCCESS: 'auth:success',
    AUTH_ERROR: 'auth:error',
    
    // Chat events
    CHAT_MESSAGE: 'chat:message',
    CHAT_SENT: 'chat:sent',
    CHAT_TYPING: 'chat:typing',
    CHAT_READ: 'chat:read',
    
    // User events
    USER_ONLINE: 'user:online',
    USER_OFFLINE: 'user:offline',
    USER_STATUS: 'user:status',
    
    // Notification events
    NOTIFICATION: 'notification',
    NOTIFICATION_READ: 'notification:read',
  },
  
  // User roles
  roles: {
    ADMIN: 'admin',
    CUSTOMER: 'customer',
    SUPPORT: 'support',
  },
  
  // Message limits
  limits: {
    MESSAGE_MAX_LENGTH: 5000,
    MESSAGE_MIN_LENGTH: 1,
    TYPING_TIMEOUT: 1000,
    RECONNECT_ATTEMPTS: 5,
  },
  
  // Timeouts
  timeouts: {
    TYPING_INDICATOR: 3000, // Hide typing after 3s of inactivity
    MESSAGE_RETRY: 5000, // Retry failed message after 5s
    CONNECTION_TIMEOUT: 20000, // 20s connection timeout
  },
};

/**
 * Get socket URL from environment or default
 */
export function getSocketUrl() {
  return SOCKET_CONFIG.url;
}

/**
 * Get socket path
 */
export function getSocketPath() {
  return SOCKET_CONFIG.path;
}

/**
 * Get socket options
 */
export function getSocketOptions(customOptions = {}) {
  return {
    ...SOCKET_CONFIG.options,
    ...customOptions,
  };
}

/**
 * Get event name
 */
export function getEventName(eventKey) {
  return SOCKET_CONFIG.events[eventKey] || eventKey;
}

/**
 * Check if user role is valid
 */
export function isValidRole(role) {
  return Object.values(SOCKET_CONFIG.roles).includes(role);
}

/**
 * Get role constant
 */
export function getRole(roleKey) {
  return SOCKET_CONFIG.roles[roleKey];
}

export default SOCKET_CONFIG;
