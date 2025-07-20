<template>
  <div
    ref="containerRef"
    class="relative w-[275px] h-12 bg-primary-900 rounded-full overflow-hidden"
  >
    <div class="absolute left-7 inset-0 flex items-center justify-center text-white">
      <slot>Przeciągnij</slot>
    </div>

    <div
      class="absolute top-0 left-0 h-full bg-primary-600 rounded-full"
      :style="{ width: `${sliderPosition+50}px` }"
    ></div>

    <div
      class="absolute left-0 top-0 h-[50px] w-[50px] bg-primary-600 rounded-full flex items-center justify-center cursor-pointer motion-preset-slide-right motion-ease-bounce"
      :style="{ transform: `translateX(${sliderPosition}px)` }"
      @mousedown="startSwipe"
      @mousemove="onSwipe"
      @mouseup="endSwipe"
      @mouseleave="endSwipe"
      @touchstart="startSwipe"
      @touchmove="onSwipe"
      @touchend="endSwipe"
    >
      <slot name="slider">⟩⟩</slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';

const emit = defineEmits(['swipeEnd']);

const containerRef = ref<HTMLDivElement | null>(null);
const containerWidth = ref(0);
const sliderPosition = ref(0);
const isSwiping = ref(false)
let startX = 0;
const sliderWidth = 45;

const updateContainerWidth = () => {
  if (containerRef.value) {
    containerWidth.value = containerRef.value.getBoundingClientRect().width;
  }
};

const handleResize = () => {
  updateContainerWidth();
};

const startSwipe = (event: MouseEvent | TouchEvent) => {
  isSwiping.value = true;
  startX = event instanceof MouseEvent ? event.clientX : event.touches[0].clientX;
};

const onSwipe = (event: MouseEvent | TouchEvent) => {
  if (!isSwiping.value) return;

  const currentX = event instanceof MouseEvent ? event.clientX : event.touches[0].clientX;
  const delta = currentX - startX;

  sliderPosition.value = Math.min(
    Math.max(0, sliderPosition.value + delta),
    containerWidth.value - sliderWidth
  );

  startX = currentX;
};

const endSwipe = () => {
  if (!isSwiping.value) return;

  if (sliderPosition.value >= 180) {
    emit('swipeEnd');
  }

  sliderPosition.value = 0;
  isSwiping.value = false;
};

onMounted(() => {
  updateContainerWidth();
  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
</style>
