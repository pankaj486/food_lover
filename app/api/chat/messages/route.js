import { NextResponse } from 'next/server';
import { verifyAccessToken } from '../../_lib/auth.js';
import { getChatHistory, getOrCreateConversation, markMessagesAsRead } from '../../_services/chatService.js';
import prisma from '../../_lib/prisma.js';

// GET /api/chat/messages?conversationId=xxx - Get chat history
export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization') || '';
    const [, token] = authHeader.split(' ');

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const payload = verifyAccessToken(token);
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');
    const customerId = searchParams.get('customerId');

    let finalConversationId = conversationId;

    // If customerId provided, get or create conversation
    if (customerId && !conversationId) {
      const conversation = await getOrCreateConversation(customerId);
      finalConversationId = conversation.id;
    }

    // If customer is requesting, get their conversation
    if (!user.isAdmin && !finalConversationId) {
      const conversation = await getOrCreateConversation(user.id);
      finalConversationId = conversation.id;
    }

    if (!finalConversationId) {
      return NextResponse.json(
        { success: false, message: 'Conversation ID required' },
        { status: 400 }
      );
    }

    const messages = await getChatHistory(finalConversationId);

    // Mark messages as read if viewing
    await markMessagesAsRead(finalConversationId, user.id);

    return NextResponse.json({
      success: true,
      conversationId: finalConversationId,
      messages,
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}
