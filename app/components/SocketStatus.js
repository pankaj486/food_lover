'use client';

import { useSocket } from '@/lib/useSocket';

export default function SocketStatus({ userId, userRole, className = '', showOnlineCount = true }) {
  const { isConnected, onlineUsers } = useSocket(userId, userRole);

  // Don't render if no userId provided
  if (!userId) return null;

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      <div className={`rounded-lg px-4 py-2 shadow-lg border transition-colors ${
        isConnected 
          ? 'bg-green-50 border-green-200 text-green-800' 
          : 'bg-red-50 border-red-200 text-red-800'
      }`}>
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${
            isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
          }`}></div>
          <span className="text-xs font-semibold">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
          {showOnlineCount && onlineUsers.length > 0 && (
            <span className="ml-2 text-xs">
              ({onlineUsers.length} online)
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Wrapper component that integrates with AuthProvider
 * Use this in authenticated pages
 */
export function SocketStatusWithAuth({ showOnlineCount = true, className = '' }) {
  // Dynamic import to avoid coupling at module level
  const { useAuth } = require('../providers/AuthProvider');
  const { user } = useAuth();

  return (
    <SocketStatus 
      userId={user?.id}
      userRole={user?.isAdmin ? 'admin' : 'customer'}
      showOnlineCount={showOnlineCount}
      className={className}
    />
  );
}
