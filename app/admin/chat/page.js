'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../providers/AuthProvider';
import ChatInterface from '../../components/ChatInterface';
import { useSocket } from '@/lib/useSocket';
import { ArrowLeft, MessageSquare, Users, UserCircle, Crown } from 'lucide-react';

export default function AdminChatPage() {
  const router = useRouter();
  const { user, isInitializing, accessToken } = useAuth();
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const { onlineUsers, messages } = useSocket(user?.id, 'admin');

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!isInitializing && !user) {
      router.push('/admin/login');
    }
    if (!isInitializing && user && !user.isAdmin) {
      router.push('/dashboard');
    }
  }, [user, isInitializing, router]);

  useEffect(() => {
    const loadConversations = async () => {
      try {
        if (!accessToken) {
          setIsLoadingConversations(false);
          return;
        }
        setIsLoadingConversations(true);
        const response = await fetch('/api/chat/conversations', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        const data = await response.json();
        if (data.success && Array.isArray(data.conversations)) {
          setConversations(data.conversations);
        }
      } catch (error) {
        console.error('Failed to load conversations:', error);
      } finally {
        setIsLoadingConversations(false);
      }
    };

    loadConversations();
  }, [accessToken]);

  // Get list of customers who have sent messages or are online
  const getCustomersList = useCallback(() => {
    const customersMap = new Map();

    // Seed from conversation history
    conversations.forEach((conversation) => {
      const customerId = conversation.customerId;
      if (!customerId) return;
      const lastMessage =
        conversation.lastMessage ||
        conversation.messages?.[0]?.message ||
        '';
      const timestamp =
        conversation.lastMessageAt ||
        conversation.messages?.[0]?.createdAt ||
        conversation.updatedAt ||
        new Date().toISOString();
      const customerName =
        conversation.customer?.name ||
        conversation.customer?.email ||
        `Customer ${customerId.slice(0, 8)}`;

      customersMap.set(customerId, {
        id: customerId,
        name: customerName,
        lastMessage,
        timestamp,
        unread: conversation.unreadCount > 0,
      });
    });

    // Add customers from messages
    messages.forEach(msg => {
      // Customer is the one who is NOT the admin
      let customerId = null;
      
      if (msg.from !== user?.id && msg.from !== 'admin') {
        customerId = msg.from;
      } else if (msg.to !== user?.id && msg.to !== 'admin') {
        customerId = msg.to;
      }
      
      if (customerId && customerId !== user?.id) {
        const existing = customersMap.get(customerId);
        if (!existing || new Date(msg.timestamp) > new Date(existing.timestamp)) {
          customersMap.set(customerId, {
            id: customerId,
            name: `Customer ${customerId.slice(0, 8)}`,
            lastMessage: msg.message,
            timestamp: msg.timestamp,
            unread: msg.from === customerId && msg.to !== customerId,
          });
        }
      }
    });

    // Add online customers
    onlineUsers.forEach(u => {
      if (u.userRole === 'customer' && u.userId !== user?.id) {
        if (!customersMap.has(u.userId)) {
          customersMap.set(u.userId, {
            id: u.userId,
            name: `Customer ${u.userId.slice(0, 8)}`,
            lastMessage: '',
            timestamp: new Date().toISOString(),
            unread: false,
          });
        }
      }
    });

    return Array.from(customersMap.values()).sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    );
  }, [messages, onlineUsers, user?.id, conversations]);

  const customers = getCustomersList();

  // Auto-select first customer if none selected
  useEffect(() => {
    if (!selectedCustomer && customers.length > 0) {
      setSelectedCustomer(customers[0]);
    }
  }, [customers, selectedCustomer]);

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-linear-to-br from-amber-50 via-orange-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user?.isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-amber-50 via-orange-50 to-white">
      {/* Navigation */}
      <nav className="bg-white/95 backdrop-blur border-b border-amber-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/admin')}
                className="text-slate-600 hover:text-slate-900 inline-flex items-center justify-center h-10 w-10 rounded-xl border border-slate-200 bg-white shadow-sm"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold bg-linear-to-r from-amber-700 to-orange-600 bg-clip-text text-transparent">
                  Admin Chat Console
                </h1>
                <p className="text-xs text-slate-500">Support conversations in real time</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-600 hidden sm:inline">
                {user.name || user.email}
              </span>
              <div className="w-10 h-10 rounded-full bg-linear-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold shadow">
                <Crown className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Chat Container */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col gap-6 lg:grid lg:grid-cols-12 lg:h-[calc(100vh-180px)]">
          {/* Customer List Sidebar */}
          <div className="lg:col-span-4 bg-white rounded-2xl shadow-[0_18px_40px_rgba(15,23,42,0.08)] border border-slate-200 overflow-hidden">
            <div className="bg-white border-b border-slate-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">Conversations</h2>
                  <p className="text-xs text-slate-500 mt-0.5">{customers.length} customer{customers.length !== 1 ? 's' : ''}</p>
                </div>
                <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                  <Users className="h-4 w-4" />
                </div>
              </div>
            </div>
            <div className="overflow-y-auto max-h-[45vh] lg:max-h-[calc(100%-72px)]">
              {isLoadingConversations ? (
                <div className="p-6 text-center text-sm text-slate-500">Loading conversations...</div>
              ) : customers.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                    <MessageSquare className="w-6 h-6 text-slate-400" />
                  </div>
                  <p className="text-sm font-medium text-slate-600">No conversations yet</p>
                  <p className="text-xs text-slate-400 mt-1">Customers will appear here when they start chatting</p>
                </div>
              ) : (
                customers.map(customer => {
                  const isOnline = onlineUsers.some(u => u.userId === customer.id);
                  const isSelected = selectedCustomer?.id === customer.id;
                  
                  return (
                    <button
                      key={customer.id}
                      onClick={() => setSelectedCustomer(customer)}
                      className={`w-full px-4 py-3 text-left border-b border-slate-100 hover:bg-slate-50 transition-colors ${
                        isSelected ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                            <UserCircle className="h-5 w-5 text-slate-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <h3 className="text-sm font-medium text-slate-900 truncate">
                                {customer.name}
                              </h3>
                              <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-green-500' : 'bg-slate-300'}`} />
                            </div>
                            <p className="text-xs text-slate-500 truncate">
                              {customer.lastMessage || 'No messages yet'}
                            </p>
                          </div>
                        </div>
                        {customer.unread && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-2" />
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-8 min-h-[55vh] lg:min-h-0">
            {selectedCustomer ? (
              <ChatInterface
                currentUserId={user.id}
                currentUserRole="admin"
                recipientId={selectedCustomer.id}
                recipientName={selectedCustomer.name}
                recipientRole="customer"
              />
            ) : (
              <div className="h-full bg-white rounded-2xl shadow-[0_18px_40px_rgba(15,23,42,0.08)] border border-slate-200 flex items-center justify-center">
                <div className="text-center text-slate-400">
                  <MessageSquare className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                  <p className="text-lg font-medium">Select a conversation</p>
                  <p className="text-sm mt-2">Choose a customer to start chatting</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
