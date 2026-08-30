import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Campus, NotificationItem } from '../types';
import { api } from '../lib/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  activeCampus: Campus | null;
  campuses: Campus[];
  notifications: NotificationItem[];
  unreadNotificationCount: number;
  login: (credentials: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  loginDemoUser: (userId: number) => Promise<void>;
  logout: () => void;
  setActiveCampus: (campus: Campus) => void;
  refreshUser: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  markNotificationsRead: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [activeCampus, setActiveCampusState] = useState<Campus | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Load campuses
  const loadCampuses = useCallback(async () => {
    try {
      const data = await api.campuses.getAll();
      setCampuses(data);
      // Default to Stanford or first campus if not set
      if (!activeCampus && data.length > 0) {
        const savedCampusId = localStorage.getItem('campusswap_campus');
        const match = data.find((c) => c.id === savedCampusId) || data[0];
        setActiveCampusState(match);
      }
    } catch (err) {
      console.error('Error fetching campuses:', err);
    }
  }, [activeCampus]);

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem('campusswap_token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const me = await api.auth.getMe();
      setUser(me);
    } catch {
      localStorage.removeItem('campusswap_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      return;
    }
    try {
      const notifs = await api.notifications.getAll();
      setNotifications(notifs);
    } catch (err) {
      console.error('Error loading notifications:', err);
    }
  }, [user]);

  // Initial load
  useEffect(() => {
    loadCampuses();
    refreshUser();
  }, [loadCampuses, refreshUser]);

  useEffect(() => {
    if (user) {
      refreshNotifications();
    }
  }, [user, refreshNotifications]);

  const login = async (credentials: any) => {
    setLoading(true);
    try {
      const { token, user: loggedInUser } = await api.auth.login(credentials);
      localStorage.setItem('campusswap_token', token);
      setUser(loggedInUser);
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: any) => {
    setLoading(true);
    try {
      const { token, user: newUser } = await api.auth.register(data);
      localStorage.setItem('campusswap_token', token);
      setUser(newUser);
    } finally {
      setLoading(false);
    }
  };

  const loginDemoUser = async (userId: number) => {
    setLoading(true);
    try {
      const { token, user: demoUser } = await api.auth.loginDemoUser(userId);
      localStorage.setItem('campusswap_token', token);
      setUser(demoUser);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('campusswap_token');
    setUser(null);
    setNotifications([]);
  };

  const setActiveCampus = (campus: Campus) => {
    setActiveCampusState(campus);
    localStorage.setItem('campusswap_campus', campus.id);
  };

  const markNotificationsRead = async () => {
    try {
      await api.notifications.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error('Failed to mark notifications read:', err);
    }
  };

  const unreadNotificationCount = notifications.filter((n) => !n.read).length;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        activeCampus,
        campuses,
        notifications,
        unreadNotificationCount,
        login,
        register,
        loginDemoUser,
        logout,
        setActiveCampus,
        refreshUser,
        refreshNotifications,
        markNotificationsRead,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
