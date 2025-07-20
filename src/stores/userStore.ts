import { defineStore } from 'pinia';
import apiClient from '../axios';
import router from '../router/router';
import { User } from '@/interfaces/user';
import { useNotificationStore } from '@/stores/notificationStore';
import { unsubscribeUserFromPush } from '@/utils/pushSubscriptions';

interface UserState {
  accessToken: string;
  refreshToken: string;
  isAuthenticated: boolean;
  isKiosk: boolean;
  data: User | null;
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    accessToken: localStorage.getItem('accessToken') || '',
    refreshToken: localStorage.getItem('refreshToken') || '',
    isAuthenticated: false,
    isKiosk: false,
    data: null,
  }),
  getters: {
    isLoggedIn(): boolean {
      return this.isAuthenticated;
    },
    registerDate(): Date | undefined {
      return this.data?.register_date;
    },
    name(): string {
      return this.data?.name || '';
    },
    surname(): string {
      return this.data?.surname || '';
    },
    email(): string {
      return this.data?.mail || '';
    },
    phone(): string {
      return this.data?.phone || '';
    }
  },
  actions: {
    async login(accessToken: string, refreshToken: string) {
      this.accessToken = accessToken;
      this.refreshToken = refreshToken;
      this.isAuthenticated = true;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      await this.fetchUserData();

      const notificationStore = useNotificationStore();
      notificationStore.askNotificationPermission();
    },
    async logout() {
      await unsubscribeUserFromPush();

      this.accessToken = '';
      this.refreshToken = '';
      this.isAuthenticated = false;
      this.data = null;
      this.isKiosk = false;

      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');

      router.push('/auth');
    },
    setAccessToken(accessToken: string) {
      this.accessToken = accessToken;
      localStorage.setItem('accessToken', accessToken);
    },
    async fetchUserData() {
      try {
        if (!this.accessToken) {
          this.isAuthenticated = false;
          return;
        }

        const response = await apiClient.get('/users/me');

        this.data = response.data;
        console.log(this.data)
        this.isAuthenticated = true;

        // if(this.isKiosk) router.push('/kiosk/solarium');
        // else router.push('/');
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    },
    
  },
});
