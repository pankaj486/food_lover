'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { MessageSquare, Send, ShieldCheck, UserCircle, Loader2 } from 'lucide-react';
import { useSocket } from '@/lib/useSocket';
import { useAuth } from '@/app/providers/AuthProvider';
import { formatMessageTime, sanitizeMessage, validateMessage } from '@/lib/socketUtils';

export default function ChatInterface({ 
  currentUserId, 
  currentUserRole, 
  recipientId, 
  recipientName = 'Support',
  recipientRole = 'admin' 
}) {
  const { accessToken } = useAuth();
  const { isConnected, messages, sendMessage, sendTypingIndicator } = useSocket(
    currentUserId,
    currentUserRole
  );
  
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState('');
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [historyMessages, setHistoryMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const inputRef = useRef(null);

  // Load message history on mount
  useEffect(() => {
    const loadHistory = async () => {
      try {
        if (!accessToken) {
          setLoadingHistory(false);
          return;
        }
        setLoadingHistory(true);
        const params = new URLSearchParams();
        
        if (recipientId !== 'admin') {
          params.append('customerId', recipientId);
        }

        const response = await fetch(`/api/chat/messages?${params}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        const data = await response.json();

        if (data.success && data.messages) {
          // Transform DB messages to match socket message format
          const formattedMessages = data.messages.map(msg => ({
            id: msg.id,
            from: msg.senderId,
            to: msg.receiverId || 'admin',
            message: msg.message,
            timestamp: msg.createdAt,
            type: msg.senderId === currentUserId ? 'sent' : 'received',
          }));
          setHistoryMessages(formattedMessages);
        }
      } catch (error) {
        console.error('Failed to load chat history:', error);
      } finally {
        setLoadingHistory(false);
      }
    };

    loadHistory();
  }, [recipientId, currentUserId, accessToken]);

  // Combine history and real-time messages
  const allMessages = [...historyMessages, ...messages];

  // Filter messages for this conversation
  const conversationMessages = allMessages.filter(msg => {
    // Show messages where:
    // 1. I sent to recipient (msg.from === currentUserId && msg.to === recipientId)
    // 2. Recipient sent to me (msg.from === recipientId)
    // 3. For admin: show messages to/from 'admin' when talking to customers
    if (recipientId === 'admin') {
      // Customer view: show messages sent to admin and any received messages to me
      return (
        (msg.from === currentUserId && msg.to === 'admin') ||
        msg.to === currentUserId
      );
    } else {
      // Admin view: show messages to/from specific customer
      return (
        (msg.from === currentUserId && msg.to === recipientId) ||
        (msg.from === recipientId && (msg.to === currentUserId || msg.to === 'admin')) ||
        (msg.from === recipientId)
      );
    }
  });
  
  console.log('🔍 All messages:', allMessages.length);
  console.log('🔍 Conversation messages:', conversationMessages.length);
  console.log('🔍 Current user:', currentUserId, 'Recipient:', recipientId);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationMessages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInput(value);
    setError('');
    
    // Send typing indicator
    if (value && !isTyping) {
      setIsTyping(true);
      sendTypingIndicator(recipientId, true);
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing indicator after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      sendTypingIndicator(recipientId, false);
    }, 2000);
  };

  const handleSend = useCallback(() => {
    if (!input.trim()) return;

    // Validate message
    const validation = validateMessage(input);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    // Sanitize and send
    const sanitized = sanitizeMessage(input);
    sendMessage(recipientId, sanitized);
    
    // Clear input and typing indicator
    setInput('');
    setError('');
    setIsTyping(false);
    sendTypingIndicator(recipientId, false);
    
    // Clear timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Focus back to input
    inputRef.current?.focus();
  }, [input, recipientId, sendMessage, sendTypingIndicator]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white/95 rounded-2xl shadow-[0_18px_40px_rgba(15,23,42,0.08)] border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-linear-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow">
              {currentUserRole === 'admin' ? (
                <UserCircle className="h-5 w-5" />
              ) : (
                <MessageSquare className="h-5 w-5" />
              )}
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">{recipientName}</h2>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-500' : 'bg-slate-400'}`} />
                <span>{isConnected ? 'Active now' : 'Offline'}</span>
              </div>
            </div>
          </div>
          {currentUserRole === 'admin' && (
            <span className="text-xs px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full font-medium inline-flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              Admin
            </span>
          )}
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-linear-to-br from-slate-50 via-white to-slate-50">
        {loadingHistory ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Loader2 className="h-8 w-8 text-blue-500 animate-spin mx-auto mb-2" />
              <p className="text-xs text-slate-400">Loading chat history...</p>
            </div>
          </div>
        ) : conversationMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-600">No messages yet</p>
            <p className="text-xs text-slate-400 mt-1">Send a message to start the conversation</p>
          </div>
        ) : (
          conversationMessages.map((msg, index) => {
            const isSent = msg.type === 'sent' || msg.from === currentUserId;
            return (
              <div
                key={msg.id || index}
                className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-2 max-w-[75%] ${isSent ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div
                    className={`rounded-2xl px-4 py-2.5 ${
                      isSent
                        ? 'bg-blue-600 text-white shadow-[0_10px_20px_rgba(37,99,235,0.25)]'
                        : 'bg-white text-slate-900 border border-slate-200 shadow-sm'
                    }`}
                  >
                    <p className="text-sm leading-relaxed wrap-break-word whitespace-pre-wrap">{msg.message}</p>
                    <p
                      className={`text-xs mt-1 ${
                        isSent ? 'text-blue-100' : 'text-slate-400'
                      }`}
                    >
                      {formatMessageTime(new Date(msg.timestamp))}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Error Message */}
      {error && (
        <div className="px-6 py-2 bg-red-50 border-t border-red-100">
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-slate-200 bg-white px-6 py-4">
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder={`Type a message...`}
              className="w-full text-black px-4 py-3 text-sm rounded-2xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none resize-none transition-all"
              rows="1"
              maxLength={5000}
              disabled={!isConnected}
            />
            <div className="flex items-center justify-between mt-1.5 px-1">
              <span className="text-xs text-slate-400">
                {input.length > 0 && `${input.length} / 5000`}
              </span>
              {isTyping && (
                <span className="text-xs text-slate-400 italic">
                  typing...
                </span>
              )}
            </div>
          </div>
          <button
            onClick={handleSend}
            disabled={!isConnected || !input.trim()}
            className="px-5 py-3 bg-blue-600 text-white rounded-2xl font-medium text-sm hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all flex items-center justify-center shadow-[0_10px_20px_rgba(37,99,235,0.25)]"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
