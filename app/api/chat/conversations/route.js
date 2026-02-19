import { NextResponse } from 'next/server';
import { verifyAccessToken } from '../../_lib/auth.js';
import { getAllConversations } from '../../_services/chatService.js';
import prisma from '../../_lib/prisma.js';

// GET /api/chat/conversations - Get all conversations (admin only)
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

    if (!user.isAdmin) {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'active';

    const conversations = await getAllConversations(status);

    return NextResponse.json({
      success: true,
      conversations,
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}
