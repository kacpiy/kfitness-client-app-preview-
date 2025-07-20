import { defineStore } from 'pinia';
import { subscribeUserToPush } from '@/utils/pushSubscriptions';
import { INotification } from '@/interfaces/notification';
import apiClient from '../axios';

interface NotificationState {
  notifications: INotification[],
  unreadNotificationsCount: number,
}

export const useNotificationStore = defineStore('notification', {
  state: (): NotificationState => ({
    notifications: [],
    unreadNotificationsCount: 0,
  }),
  actions: {
    async fetchNotifications() {
      try {
        const response = await apiClient.get<INotification[]>('/notifications/me');
        const notifications = response.data;

        this.unreadNotificationsCount = notifications.filter((notification) => !notification.isRead).length;
        //this.setUnreadNotificationsBadge(this.unreadNotificationsCount);

        this.notifications = notifications;
      } catch (error) {
        console.error('Error fetching card data:', error);
      }
    },

    async markAllNotificationsAsRead() {
      try {
        await apiClient.patch('/notifications/me/read');
        this.unreadNotificationsCount = 0;
        this.clearUnreadNotificationsBadge();
      } catch (error) {
        console.error('Error marking notifications as read:', error);
      }
    },

    setUnreadNotificationsBadge(count: number) {
      if ('setAppBadge' in navigator) {
        navigator.setAppBadge(count).catch((error) => {
          console.error('Failed to set app badge:', error);
        });
      }
    },

    clearUnreadNotificationsBadge() {
      if ('clearAppBadge' in navigator) {
        navigator.clearAppBadge().catch((error) => {
          console.error('Failed to clear app badge:', error);
        });
      }
    },

    async askNotificationPermission() {
      if (!('Notification' in window)) {
        console.log('This browser does not support notifications.');
        return;
      }

      const permission = Notification.permission;

      if (permission === 'granted') {
        console.log('Notifications are already enabled.');
        await subscribeUserToPush();
        return;
      }

      if (permission === 'default') {
        try {
          const userPermission = await Notification.requestPermission();
          if (userPermission === 'granted') {
            console.log('User granted notification permissions.');
            await subscribeUserToPush();
          } else {
            console.log('User denied or closed the notification permission dialog.');
          }
        } catch (error) {
          console.error('Failed to request notification permissions', error);
        }
      } else {
        console.log('User has already denied notifications.');
      }
    },
  },
  getters: {
    unreadNotifications(): INotification[] {
      return this.notifications.filter((notification) => !notification.isRead);
    },
    readNotifications(): INotification[] {
      return this.notifications.filter((notification) => notification.isRead);
    }
  }
});