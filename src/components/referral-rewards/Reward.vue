<script setup lang="ts">
import { format } from 'date-fns';
import RewardImg from '@/assets/images/reward_17500111.png';
import { computed } from 'vue';

const props = defineProps<{
  reward: ReferralReward;
}>();

const statusMap = {
  '10': { label: 'Nowa',    bg: 'bg-green-100', text: 'text-green-800' },
  '30': { label: 'Odebrana', bg: 'bg-blue-100',  text: 'text-blue-800'  },
  '90': { label: 'Wygasła',  bg: 'bg-red-100',   text: 'text-red-800'   }
}

const statusConfig = computed(() => {
  return statusMap[props.reward.status] || {
    label: 'Nieznany',
    bg: 'bg-gray-100',
    text: 'text-gray-800'
  }
})

function formatDate(dateString: string | null): string {
  if (!dateString) {
    return 'Brak danych';
  }
  const date = new Date(dateString);
  return format(date, 'dd.MM.yyyy');
}
</script>

<template>
  <div class="w-[150px] flex-shrink-0 bg-neutral-900 shadow-lg rounded-lg relative" :class="{ 'opacity-30': reward.status !== '10' }">
    <img :src="RewardImg" alt="Medal" class="w-12 mx-auto absolute opacity-20" />
    <div class="p-4 relative z-20 block">
      <p class="text-white font-bold text-center mb-2">
        {{ reward.notes }}
      </p>
      <h2 class="text-4xl text-center font-bold text-primary-500">
        {{ reward.value }}
        <span v-if="reward.type === 'percentage'">%</span>
        <span v-else-if="reward.type === 'amount'">zł</span>
      </h2>
      <hr class="my-3"/>
      <div class="space-y-3">
        <p class="text-sm text-gray-200 flex flex-col text-center">
          <span :class="[
            statusConfig.bg,
            statusConfig.text
          ]"> 
            {{ statusConfig.label }}
          </span>
        </p>
        <p class="text-sm text-gray-200 flex flex-col text-center" v-if="reward.status === '10'">
          <strong>Wygasa</strong> {{ formatDate(reward.expirationDate) }}
        </p>
        <p class="text-sm text-gray-200 flex flex-col text-center" v-if="reward.status === '30'">
          <strong>Odebrana</strong> {{ formatDate(reward.collectedDate) }}
        </p>
        <p 
          v-if="reward.status === '10'"
          @click="$emit('collect', reward.id)"
          class="text-sm text-primary-500 bg-neutral-800 flex flex-col text-center p-2 border border-primary-500 rounded-md">
          <strong>Odbierz</strong>
        </p>
      </div>
    </div>
  </div>
</template>

<style>

</style>
