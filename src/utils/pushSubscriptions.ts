import { urlBase64ToUint8Array } from './index';
import apiClient from '@/axios';

export const subscribeUserToPush = async () => {
  
};

export const unsubscribeUserFromPush = async () => {
  
};

// export const subscribeUserToPush = async (token: string) => {
//   try {
//     await apiClient.post('/push-subscriptions/subscribe-fcm', { token });
//   } catch (error) {
//     console.error('Failed to subscribe user to push notifications:', error);
//   }
// };