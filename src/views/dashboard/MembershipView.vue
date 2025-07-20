<script setup lang="ts">
import { ComputedRef, computed, onMounted, ref } from 'vue';
import { differenceInDays, startOfDay, format } from 'date-fns';
import { pl } from 'date-fns/locale';

import { useCardStore } from '../../stores/cardStore';
import { Card } from '../../interfaces/card';

import formaKarnetImg from '@/assets/forma-karnet.jpg';
import { useUserStore } from '@/stores/userStore';

//@ts-ignore
import Vue3Barcode from 'vue3-barcode'
import TheBottomSheet from '@/components/TheBottomSheet.vue';

const userStore = useUserStore();
const cardStore = useCardStore();

const bottomSheet = ref<BottomSheetInstance | null>(null);
const user = computed(() => userStore.data);

const card: ComputedRef<Card | null> = computed(() => cardStore.card);

const daysDiff = computed(() => {
  if (card.value && card.value.expireDate) {
    const expireDate = startOfDay(new Date(card.value.expireDate));
    const today = startOfDay(new Date());
    
    return differenceInDays(expireDate, today);
  }
  return 0;
});

const showCardBarcode = () => {
  bottomSheet.value?.open()
}

const loadData = () => {
  cardStore.fetchCardData();
}

onMounted(() => {
  loadData();
});

</script>

<template>
  <div v-if="card">
    <PullToRefresh @refresh="loadData()">
      <div class="px-4 overflow-hidden">
        <div class="bg-neutral-900 mt-1 rounded-tl-xl rounded-tr-xl flex justify-center relative">
          <img :src="formaKarnetImg" alt="Forma Karnet" class="w-[275px]" />
          <div class="absolute right-2 top-2 flex flex-col justify-center bg-primary/5 rounded-md py-2 px-3 gap-1 cursor-pointer" @click="showCardBarcode">
            <font-awesome-icon :icon="['fas', 'barcode']" class="text-primary-500 mx-auto" size="xl"/>
            <div class="text-xs">Pokaż kod</div>
          </div>
        </div>
        <div class="bg-neutral-900 mt-1 rounded-bl-xl rounded-br-xl p-3 motion-preset-fade">
          <div v-if="card.ticket">
            
          </div>
        </div>
        <p class="text-xs text-gray text-center mt-3" v-if="card?.ticket?.name === 'FULL'">Przedłuż karnet w trakcie lub do 3 dni od wygaśnięcia obecnego i skorzystaj z promocyjnej ceny - zgodnie z cennikiem na stronie <a href="https://forma-fitness.pl">forma-fitness.pl</a></p>
      </div>
    </PullToRefresh>
    <TheBottomSheet ref="bottomSheet" light>
      <div class="flex flex-col items-center justify-center text-black bg-white">
        <h1 class="text-center">Pokaż ten kod na recepcji, aby szybciej wyszukać Cię w naszym systemie</h1>
        <Vue3Barcode
          :value="card.code" :height="50" background="transparent" :display-value="false" format="CODE128"
        />
        <h3 class="text-center text-xs">{{ user!.name }} {{ user!.surname }} | {{ card.code }}</h3>
      </div>
    </TheBottomSheet>
  </div>
</template>

<style scoped>
</style>