import User from './User';
import Listing from './Listing';
import Favorite from './Favorite';
import Conversation from './Conversation';
import Message from './Message';
import Review from './Review';
import Notification from './Notification';

// User <-> Listing (Seller)
User.hasMany(Listing, { foreignKey: 'sellerId', as: 'listings' });
Listing.belongsTo(User, { foreignKey: 'sellerId', as: 'seller' });

// User <-> Listing (Buyer)
User.hasMany(Listing, { foreignKey: 'buyerId', as: 'purchases' });
Listing.belongsTo(User, { foreignKey: 'buyerId', as: 'buyer' });

// User <-> Favorite <-> Listing
User.hasMany(Favorite, { foreignKey: 'userId', as: 'favorites' });
Favorite.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Listing.hasMany(Favorite, { foreignKey: 'listingId', as: 'favoritedBy' });
Favorite.belongsTo(Listing, { foreignKey: 'listingId', as: 'listing' });

// User & Listing <-> Conversation
User.hasMany(Conversation, { foreignKey: 'buyerId', as: 'buyerConversations' });
Conversation.belongsTo(User, { foreignKey: 'buyerId', as: 'buyer' });

User.hasMany(Conversation, { foreignKey: 'sellerId', as: 'sellerConversations' });
Conversation.belongsTo(User, { foreignKey: 'sellerId', as: 'seller' });

Listing.hasMany(Conversation, { foreignKey: 'listingId', as: 'conversations' });
Conversation.belongsTo(Listing, { foreignKey: 'listingId', as: 'listing' });

// Conversation <-> Message
Conversation.hasMany(Message, { foreignKey: 'conversationId', as: 'messages', onDelete: 'CASCADE' });
Message.belongsTo(Conversation, { foreignKey: 'conversationId', as: 'conversation' });

User.hasMany(Message, { foreignKey: 'senderId', as: 'sentMessages' });
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });

// User <-> Review
User.hasMany(Review, { foreignKey: 'reviewerId', as: 'givenReviews' });
Review.belongsTo(User, { foreignKey: 'reviewerId', as: 'reviewer' });

User.hasMany(Review, { foreignKey: 'targetUserId', as: 'receivedReviews' });
Review.belongsTo(User, { foreignKey: 'targetUserId', as: 'targetUser' });

// Listing <-> Review
Listing.hasMany(Review, { foreignKey: 'listingId', as: 'reviews' });
Review.belongsTo(Listing, { foreignKey: 'listingId', as: 'listing' });

// User <-> Notification
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

export {
  User,
  Listing,
  Favorite,
  Conversation,
  Message,
  Review,
  Notification,
};
