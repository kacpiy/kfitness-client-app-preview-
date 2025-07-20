<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useUserStore } from '@/stores/userStore';
import apiClient from '@/axios';
import Dialog from 'primevue/dialog';

const userStore = useUserStore();
const user = computed(() => userStore.data);

const referralUsers = ref<ReferralUsers[]>([]);

const fetchReferralUsers = async () => {
  try {
    const response = await apiClient.get<ReferralUsers[]>('/users/me/referrals');
    const data = response.data;
    referralUsers.value = data;
  } catch (error) {
    console.error('Error fetching referral users:', error);
  }
}

const loadData = () => {
  fetchReferralUsers();
}

onMounted(() => {
  loadData();
}); 

const visible = ref(false);
</script>

<template>
  <div class="px-4">
    <h1 class="text-lg font-medium mb-4">Usługi dodatkowe</h1>
    <div class="grid grid-cols-3 gap-2">
      <RouterLink to="/dashboard/more/solarium">
        <div class="p-4 bg-neutral-900 rounded-md text-center flex flex-col gap-3">
          <font-awesome-icon :icon="['fas', 'sun']" class="text-primary-500 mx-auto" size="2xl"/>
          <h1 class="text-sm">Solarium</h1>
        </div>
      </RouterLink>
    </div>
    
    <h1 class="text-lg font-medium mt-8 mb-4">Polecaj i zdobywaj nagrody!</h1>
     <div class="flex flex-col gap-3">
      <div class="grid grid-cols-3 gap-2 mb-2">
        <RouterLink to="/dashboard/more/referral-rewards">
          <div class="p-4 bg-neutral-900 rounded-md text-center flex flex-col gap-3">
            <font-awesome-icon :icon="['fas', 'award']" class="text-primary-500 mx-auto" size="2xl"/>
            <h1 class="text-sm">Zdobyte nagrody</h1>
          </div>
        </RouterLink>
        <div class="px-4 rounded-md flex flex-col text-center justify-around">
          <h1 class="text-6xl font-medium">{{ referralUsers.length }}</h1>
          <div class="text-sm">Osób poleconych</div>
        </div>
      </div>
      <div class="p-3 bg-primary/30 rounded-md text-center flex flex-col w-[300px] mx-auto shadow-primary/70 shadow-md">
        <h2>Twój kod polecający</h2>
        <h1 class="font-medium text-xl">{{ user?.referralCode }}</h1>
      </div>
      <div class="text-xs text-center mt-2 flex items-center justify-center gap-2" @click="visible = true">
        <span class="pi pi-info-circle"></span>
        Zobacz jak działa program poleceń
      </div>
    </div>
    <Dialog v-model:visible="visible" modal dismissableMask header="Jak działa system poleceń?" :style="{ width: '90%' }" class="text-sm" @update:visible="visible = false">
      <div>
        <p class="mb-2">Warunki:</p>
        <ul class="list-disc list-inside">
          <li>Osoba polecona musi przyjśc do nas z Twoim kodem polecającym oraz zakupić karnet za min. 150zł (np. karnet miesięczny lub min. 10 wejść)</li>
        </ul>
        <p class="mt-4 mb-2">Co otrzymujecie w zamian?</p>
        <ul class="list-disc list-inside">
          <li>Osoba polecona nie płaci za aktywację karty (20 zł)</li>
          <li>Ty, jako polecający/a, otrzymujesz 50% zniżki na swój kolejny miesięczny karnet.</li>
        </ul>
        <p class="mt-4 mb-2">
          <span class="pi pi-exclamation-triangle text-red-600"></span> Niewykorzystane nagrody z Reccome możesz zrealizować do 31 sierpnia 2025r.
        </p>
      </div>
    </Dialog>
  </div>
</template>

<style scoped>

</style>