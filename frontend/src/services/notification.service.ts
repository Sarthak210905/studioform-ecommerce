import { api } from '@/lib/axios';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'order' | 'product' | 'promotion';
  is_read: boolean;
  created_at: string;
  action_url?: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  unread_count: number;
}

const notificationService = {
  getNotifications: async (unreadOnly: boolean = false): Promise<NotificationsResponse> => {
    const response = await api.get(`/notifications/?unread_only=${unreadOnly}`);
    return response.data;
  },

  markAsRead: async (notificationId: string): Promise<void> => {
    await api.put(`/notifications/${notificationId}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await api.put('/notifications/mark-all-read');
  },

  deleteNotification: async (notificationId: string): Promise<void> => {
    await api.delete(`/notifications/${notificationId}`);
  },
};

export default notificationService;
