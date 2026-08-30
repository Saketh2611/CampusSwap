import { Listing, User, Conversation, Message, Review, Campus, NotificationItem } from '../types';

const API_BASE = '/api';

function getHeaders(): HeadersInit {
  const token = localStorage.getItem('campusswap_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getHeaders(),
      ...(options.headers || {}),
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }

  return data.data !== undefined ? data.data : data;
}

export const api = {
  // Auth
  auth: {
    register: (payload: any) => request<{ token: string; user: User }>('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
    login: (payload: any) => request<{ token: string; user: User }>('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
    getMe: () => request<User>('/auth/me'),
    getDemoUsers: () => request<User[]>('/auth/demo-users'),
    loginDemoUser: (userId: number) => request<{ token: string; user: User }>(`/auth/demo-login/${userId}`, { method: 'POST' }),
  },

  // Listings
  listings: {
    getAll: (params: Record<string, any> = {}) => {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      return request<{ listings: Listing[]; total: number; page: number; totalPages: number; hasMore: boolean }>(
        `/listings${queryString ? `?${queryString}` : ''}`
      );
    },
    getById: (id: number) => request<Listing>(`/listings/${id}`),
    create: (data: Partial<Listing>) => request<Listing>('/listings', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: Partial<Listing>) => request<Listing>(`/listings/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) => request<{ success: boolean; message: string }>(`/listings/${id}`, { method: 'DELETE' }),
    toggleFavorite: (id: number) => request<{ favorited: boolean; favoritesCount: number }>(`/listings/${id}/favorite`, { method: 'POST' }),
    getFavorites: () => request<Listing[]>('/listings/favorites'),
    updateStatus: (id: number, status: 'active' | 'pending' | 'sold', buyerId?: number) =>
      request<Listing>(`/listings/${id}/status`, { method: 'PUT', body: JSON.stringify({ status, buyerId }) }),
  },

  // Users
  users: {
    getProfile: (id: number) => request<User>(`/users/${id}`),
    updateProfile: (data: Partial<User>) => request<User>('/users/profile', { method: 'PUT', body: JSON.stringify(data) }),
    getUserListings: (id: number, status?: string) =>
      request<Listing[]>(`/users/${id}/listings${status ? `?status=${status}` : ''}`),
    verifyEdu: (email: string) => request<{ success: boolean; message: string; user: any }>('/users/verify-edu', { method: 'POST', body: JSON.stringify({ email }) }),
  },

  // Conversations & Messaging
  conversations: {
    getAll: () => request<Conversation[]>('/conversations'),
    start: (listingId: number, initialMessage?: string) =>
      request<{ conversation: Conversation; messages: Message[] }>('/conversations/start', {
        method: 'POST',
        body: JSON.stringify({ listingId, initialMessage }),
      }),
    getMessages: (conversationId: number) =>
      request<{ conversation: Conversation; messages: Message[] }>(`/conversations/${conversationId}`),
    sendMessage: (
      conversationId: number,
      text: string,
      messageType: 'text' | 'offer' | 'meetup_proposal' | 'system' = 'text',
      metadata?: any
    ) =>
      request<Message>(`/conversations/${conversationId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ text, messageType, metadata }),
      }),
  },

  // Reviews
  reviews: {
    getUserReviews: (userId: number) => request<Review[]>(`/reviews/user/${userId}`),
    createReview: (payload: { targetUserId: number; listingId?: number; rating: number; comment: string; role?: 'buyer' | 'seller' }) =>
      request<Review>('/reviews', { method: 'POST', body: JSON.stringify(payload) }),
  },

  // Campuses
  campuses: {
    getAll: () => request<Campus[]>('/campuses'),
    getById: (id: string) => request<Campus>(`/campuses/${id}`),
  },

  // Notifications
  notifications: {
    getAll: () => request<NotificationItem[]>('/notifications'),
    markAllRead: () => request<{ success: boolean }>('/notifications/read-all', { method: 'PUT' }),
  },
};
