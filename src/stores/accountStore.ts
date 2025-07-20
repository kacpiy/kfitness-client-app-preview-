import { defineStore } from 'pinia';

export const useAccountStore = defineStore('account', {
  state: () => ({
    isLinked: false
  }),

  actions: {
    connectAccount() {
      this.isLinked = true;
      localStorage.setItem('accountLinked', 'true');
    },
    loadConnectionStatus() {
      const storedStatus = localStorage.getItem('accountLinked');
      this.isLinked = storedStatus === 'true';
    },
  },
});