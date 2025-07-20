<template>
  <div
    @touchstart="onTouchStart"
    @touchmove="onTouchMove"
    @touchend="onTouchEnd"
    class="scroll-container relative"
    :style="{ transform: `translateY(${translateY}px)` }"
  >
    <div class="icon-container flex items-center justify-center absolute top-2 left-0 right-0 z-50"
         :style="{ opacity: isPulling || isRefreshing ? 1 : 0, transform: `translateY(-${30-translateY}px)` }">
      <font-awesome-icon :icon="['fas', 'spinner']" class="text-white animate-spin" size="xl"/>
    </div>

    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

const emit = defineEmits(['refresh']);

const startY = ref(0);
const isPulling = ref(false);
const isRefreshing = ref(false);
const translateY = ref(0); 

const onTouchStart = (event: TouchEvent) => {
  if (window.scrollY === 0) {
    startY.value = event.touches[0].clientY;
  }
};

const onTouchMove = (event: TouchEvent) => {
  const currentY = event.touches[0].clientY;
  const diff = currentY - startY.value;

  if (diff > 0 && !isRefreshing.value) {
    translateY.value = Math.min(diff, 30); 
    isPulling.value = true;
  }
};


const onTouchEnd = async () => {
  if (isPulling.value) {
    isPulling.value = false;
    isRefreshing.value = true;

    await refreshData();
    isRefreshing.value = false;
    translateY.value = 0;
  }
};

const refreshData = async () => {
  emit('refresh');
};
</script>

<style scoped>
.scroll-container {
  overflow-y: auto;
  height: 100%;
  transition: transform 0.3s ease;
}

.icon-container {
  height: 50px;
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.font-awesome-icon {
  transition: opacity 0.3s ease;
}
</style>
