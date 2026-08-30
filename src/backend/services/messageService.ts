import { Op } from 'sequelize';
import { Conversation, Message, User, Listing, Notification } from '../models';
import { AppError } from '../middleware/errorHandler';

export class MessageService {
  static async getUserConversations(userId: number) {
    const conversations = await Conversation.findAll({
      where: {
        [Op.or]: [{ buyerId: userId }, { sellerId: userId }],
      },
      include: [
        {
          model: User,
          as: 'buyer',
          attributes: ['id', 'name', 'avatar', 'university', 'campus', 'dorm', 'studentIdVerified'],
        },
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'name', 'avatar', 'university', 'campus', 'dorm', 'studentIdVerified'],
        },
        {
          model: Listing,
          as: 'listing',
          attributes: ['id', 'title', 'price', 'images', 'status', 'pickupLocation', 'campus'],
        },
      ],
      order: [['lastMessageAt', 'DESC']],
    });

    return conversations;
  }

  static async getConversationMessages(conversationId: number, userId: number) {
    const conversation = await Conversation.findByPk(conversationId, {
      include: [
        {
          model: User,
          as: 'buyer',
          attributes: ['id', 'name', 'avatar', 'university', 'campus', 'dorm', 'studentIdVerified'],
        },
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'name', 'avatar', 'university', 'campus', 'dorm', 'studentIdVerified'],
        },
        {
          model: Listing,
          as: 'listing',
        },
      ],
    });

    if (!conversation) {
      throw new AppError('Conversation not found', 404);
    }

    if (conversation.buyerId !== userId && conversation.sellerId !== userId) {
      throw new AppError('Unauthorized access to conversation', 403);
    }

    const messages = await Message.findAll({
      where: { conversationId },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'name', 'avatar'],
        },
      ],
      order: [['createdAt', 'ASC']],
    });

    // Mark messages as read if sent by other participant
    await Message.update(
      { read: true },
      {
        where: {
          conversationId,
          senderId: { [Op.ne]: userId },
          read: false,
        },
      }
    );

    return {
      conversation,
      messages,
    };
  }

  static async startOrGetConversation(listingId: number, buyerId: number, initialMessage?: string) {
    const listing = await Listing.findByPk(listingId);
    if (!listing) {
      throw new AppError('Listing not found', 404);
    }

    if (listing.sellerId === buyerId) {
      throw new AppError('You cannot message yourself about your own listing', 400);
    }

    let conversation = await Conversation.findOne({
      where: {
        listingId,
        buyerId,
        sellerId: listing.sellerId,
      },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        listingId,
        buyerId,
        sellerId: listing.sellerId,
        lastMessageText: initialMessage || 'Hi! Is this item still available on campus?',
        lastMessageAt: new Date(),
      });

      // Send initial inquiry message
      await Message.create({
        conversationId: conversation.id,
        senderId: buyerId,
        text: initialMessage || `Hi! I saw your "${listing.title}" for $${listing.price}. Is it still available to meet up?`,
        messageType: 'text',
        read: false,
      });

      // Notify seller
      await Notification.create({
        userId: listing.sellerId,
        type: 'message',
        title: 'New Campus Inquiry',
        message: `A student messaged you about "${listing.title}".`,
        link: `/messages/${conversation.id}`,
        read: false,
      });
    }

    return this.getConversationMessages(conversation.id, buyerId);
  }

  static async sendMessage(
    conversationId: number,
    senderId: number,
    text: string,
    messageType: 'text' | 'offer' | 'meetup_proposal' | 'system' = 'text',
    metadata?: any
  ) {
    const conversation = await Conversation.findByPk(conversationId, {
      include: [{ model: Listing, as: 'listing' }],
    });

    if (!conversation) {
      throw new AppError('Conversation not found', 404);
    }

    if (conversation.buyerId !== senderId && conversation.sellerId !== senderId) {
      throw new AppError('Unauthorized to send message in this conversation', 403);
    }

    const message = await Message.create({
      conversationId,
      senderId,
      text,
      messageType,
      metadata,
      read: false,
    });

    await conversation.update({
      lastMessageText: text,
      lastMessageAt: new Date(),
    });

    const recipientId = conversation.buyerId === senderId ? conversation.sellerId : conversation.buyerId;

    let notifTitle = 'New message';
    if (messageType === 'offer') notifTitle = `New offer on ${conversation.listing?.title || 'item'}`;
    if (messageType === 'meetup_proposal') notifTitle = 'Proposed campus meetup spot';

    await Notification.create({
      userId: recipientId,
      type: messageType === 'offer' ? 'offer' : 'message',
      title: notifTitle,
      message: text,
      link: `/messages/${conversationId}`,
      read: false,
    });

    const fullMessage = await Message.findByPk(message.id, {
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'name', 'avatar'],
        },
      ],
    });

    return fullMessage;
  }
}
