import prisma from '../_lib/prisma.js';

/**
 * Get or create a conversation between customer and admin
 */
export async function getOrCreateConversation(customerId) {
  try {
    // Find existing conversation
    let conversation = await prisma.conversation.findFirst({
      where: {
        customerId,
        status: 'active',
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Create if doesn't exist
    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          customerId,
          status: 'active',
        },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    }

    return conversation;
  } catch (error) {
    console.error('Error getting/creating conversation:', error);
    throw error;
  }
}

/**
 * Save a chat message to database
 */
export async function saveChatMessage({ conversationId, senderId, receiverId, message }) {
  try {
    const chatMessage = await prisma.chatMessage.create({
      data: {
        conversationId,
        senderId,
        receiverId,
        message,
        isRead: false,
      },
    });

    // Update conversation's last message
    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessage: message,
        lastMessageAt: new Date(),
        unreadCount: {
          increment: 1,
        },
      },
    });

    return chatMessage;
  } catch (error) {
    console.error('Error saving chat message:', error);
    throw error;
  }
}

/**
 * Get chat history for a conversation
 */
export async function getChatHistory(conversationId, limit = 50, skip = 0) {
  try {
    const messages = await prisma.chatMessage.findMany({
      where: {
        conversationId,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            isAdmin: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip,
    });

    return messages.reverse(); // Return in chronological order
  } catch (error) {
    console.error('Error getting chat history:', error);
    throw error;
  }
}

/**
 * Get all conversations for admin
 */
export async function getAllConversations(status = 'active') {
  try {
    const conversations = await prisma.conversation.findMany({
      where: {
        status,
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
      orderBy: {
        lastMessageAt: 'desc',
      },
    });

    return conversations;
  } catch (error) {
    console.error('Error getting conversations:', error);
    throw error;
  }
}

/**
 * Mark messages as read
 */
export async function markMessagesAsRead(conversationId, userId) {
  try {
    await prisma.chatMessage.updateMany({
      where: {
        conversationId,
        receiverId: userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    // Reset unread count
    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        unreadCount: 0,
      },
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    throw error;
  }
}

/**
 * Get conversation by customer ID
 */
export async function getConversationByCustomerId(customerId) {
  try {
    const conversation = await prisma.conversation.findFirst({
      where: {
        customerId,
        status: 'active',
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return conversation;
  } catch (error) {
    console.error('Error getting conversation:', error);
    throw error;
  }
}
