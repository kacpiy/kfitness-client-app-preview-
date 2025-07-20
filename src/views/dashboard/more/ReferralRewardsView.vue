<script setup lang="ts">
import apiClient from '@/axios';
import { onMounted, ref } from 'vue';
import Reward from '@/components/referral-rewards/Reward.vue';
import TheBottomSheet from '@/components/TheBottomSheet.vue';
//@ts-ignore
import Vue3Barcode from 'vue3-barcode'

const referralRewards = ref<ReferralReward[]>([]);
const referralUsers = ref<ReferralUsers[]>([]);

const selectedReward = ref<ReferralReward | null>(null);
const bottomSheet = ref<BottomSheetInstance | null>(null);

const fetchReferralRewards = async () => {
  try {
    const response = await apiClient.get<any>('/referral-rewards/me');
    const data = response.data;
    referralRewards.value = data;
  } catch (error) {
    console.error('Error fetching referral awards:', error);
  }
}

const fetchReferralUsers = async () => {
  try {
    const response = await apiClient.get<ReferralUsers[]>('/users/me/referrals');
    const data = response.data;
    referralUsers.value = data;
  } catch (error) {
    console.error('Error fetching referral users:', error);
  }
}

const collectReward = (id: number) => {
  selectedReward.value = referralRewards.value.find(reward => reward.id === id) || null;
  bottomSheet.value?.open()
}

const loadData = () => {
  fetchReferralRewards();
  fetchReferralUsers();
}

onMounted( () => {
  loadData();
});
</script>

<template>
  <div>
    <PullToRefresh @refresh="() => loadData()">
      <div class="px-4 overflow-hidden">
        <h1 class="text-xl font-bold mb-4">Polecaj i zdobywaj nagrody!</h1>
        <h1 class="text-xl font-medium mt-7 mb-3">Zdobyte nagrody</h1>
        <div class="overflow-x-auto flex gap-4" v-if="!!referralRewards.length">
          <Reward
            v-for="reward in referralRewards" 
            :key="reward.rewardCode" 
            :reward="reward" @collect="collectReward"/>
        </div>
        <p class="text-center" v-if="referralRewards.length === 0">Nie zdobyłeś jeszcze żadnych nagród</p>
        
       
        <h1 class="text-xl font-medium mt-7 mb-2">Poleceni klubowicze</h1>
        <div v-if="!!referralUsers.length">
          <p v-for="(user, index) in referralUsers" :key="user.id" class="mb-2">
            {{ index+ 1 }}. {{ user.name }} {{ user.surname }} 
          </p>
        </div>
        <div v-else class="text-center">Nie masz jeszcze żadnych poleconych klubowiczów</div>
      </div>
    </PullToRefresh>
    <TheBottomSheet ref="bottomSheet" light>
      <div class="flex flex-col text-black">
        <h1 class="text-2xl font-bold text-center">Odbierz nagrodę</h1>
        <p class="text-sm text-center">Pokaż ten kod przy odbiorze nagrody w recepcji klubu.</p>
        <div class="flex justify-center">
          <Vue3Barcode :value="selectedReward?.rewardCode" background="transparent" format="CODE128" :height="50" :displayValue="false" />
        </div>
        <h3 class="text-center text-xs">{{ selectedReward?.rewardCode }}</h3>
      </div>
    </TheBottomSheet>
  </div>
</template>

<style scoped>


</style>