import { defineStore } from 'pinia';
import apiClient from '../axios';
import { Card, CardUseAction } from '@/interfaces/card';

interface CardState {
  data: Card | null; 
}

export const useCardStore = defineStore('card', {
  state: (): CardState => ({
    data: null,
  }),
  getters: {
    card(): Card | null {
      return this.data;
    },
    cardExpiration(): string | null {
      return this.data?.expireDate ? new Date(this.data.expireDate).toLocaleDateString() : null;
    },
  },
  actions: {
    async fetchCardData() {
      try {
        const response = await apiClient.get('/cards/me');
        const cardData: Card = response.data;
        
        this.data = cardData;
        console.log(this.data)
      } catch (error) {
        console.error('Error fetching card data:', error);
      }
    },
    async useCard(method: string, location_uuid: string, action: CardUseAction) {
      try {
        const response = await apiClient.post('/cards/me/use', { method, location_uuid, action });
        this.fetchCardData();
        return response;
      } catch (error: any) {
        console.error('Error checking card access:', error);

        if (error.response && error.response.data && error.response.data.message) {
          throw new Error(error.response.data.message);
        }
    
        throw new Error('Wystąpił błąd podczas użycia karty.');
      }
    },
    clearCardData() {
      this.data = null;
    }
  },
});
