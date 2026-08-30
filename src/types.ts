export interface User {
  id: number;
  name: string;
  email: string;
  university: string;
  campus: string;
  dorm?: string;
  studentIdVerified: boolean;
  avatar: string;
  bio?: string;
  graduationYear?: number;
  rating: number;
  reviewCount: number;
  createdAt?: string;
  updatedAt?: string;
  listings?: Listing[];
  receivedReviews?: Review[];
}

export type ListingCondition = 'Brand New' | 'Like New' | 'Good' | 'Fair';
export type ListingStatus = 'active' | 'pending' | 'sold';

export interface Listing {
  id: number;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  condition: ListingCondition;
  status: ListingStatus;
  images: string[];
  campus: string;
  pickupLocation: string;
  isNegotiable: boolean;
  views: number;
  favoritesCount: number;
  sellerId: number;
  buyerId?: number;
  seller?: User;
  isFavorited?: boolean;
  favoritedAt?: string;
  soldAt?: string;
  createdAt: string;
  updatedAt: string;
  reviews?: Review[];
}

export interface Conversation {
  id: number;
  listingId: number;
  buyerId: number;
  sellerId: number;
  lastMessageText?: string;
  lastMessageAt?: string;
  buyer?: User;
  seller?: User;
  listing?: Listing;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: number;
  conversationId: number;
  senderId: number;
  text: string;
  messageType: 'text' | 'offer' | 'meetup_proposal' | 'system';
  metadata?: {
    offerAmount?: number;
    location?: string;
    time?: string;
    accepted?: boolean;
  };
  read: boolean;
  sender?: User;
  createdAt: string;
}

export interface Review {
  id: number;
  reviewerId: number;
  targetUserId: number;
  listingId?: number;
  rating: number;
  comment: string;
  role: 'buyer' | 'seller';
  reviewer?: User;
  listing?: Listing;
  createdAt: string;
}

export interface SafePickupZone {
  name: string;
  landmark: string;
  safeZoneHours: string;
}

export interface Campus {
  id: string;
  name: string;
  shortName: string;
  location: string;
  verifiedStudents: number;
  activeListings: number;
  safePickupZones: SafePickupZone[];
}

export interface NotificationItem {
  id: number;
  userId: number;
  type: 'message' | 'offer' | 'price_drop' | 'order' | 'review' | 'system';
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
}
