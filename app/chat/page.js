'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../providers/AuthProvider';
import ChatInterface from '../components/ChatInterface';
import Link from 'next/link';

export default function ChatPage() {
  const router = useRouter();
  const { user, isInitializing } = useAuth();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isInitializing && !user) {
      router.push('/login');
    }
  }, [user, isInitializing, router]);

  // Redirect admins to admin chat
  useEffect(() => {
    if (!isInitializing && user?.isAdmin) {
      router.push('/admin/chat');
    }
  }, [user, isInitializing, router]);

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

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-amber-50 via-orange-50 to-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-amber-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-slate-600 hover:text-slate-900">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <h1 className="text-2xl font-bold bg-linear-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                Support Chat
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-600">
                {user.name || user.email}
              </span>
              <div className="w-10 h-10 rounded-full bg-linear-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold">
                {(user.name || user.email)?.[0]?.toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Chat Container */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="h-[calc(100vh-180px)]">
          <ChatInterface
            currentUserId={user.id}
            currentUserRole="customer"
            recipientId="admin"
            recipientName="Customer Support"
            recipientRole="admin"
          />
        </div>
      </div>
    </div>
  );
}
