<template>
  <div class="test">
    <BottomSheet 
      ref="bottomSheet"
      >
      <div class="pb-10" :class="{'text-white': !props.light}">
        <div v-if="props.title" class="font-semibold text-lg pb-2 mb-4 border-b" :class="{'border-gray-700': !props.light, 'border-gray-200': props.light}">
          {{ props.title }}
        </div>
        <slot></slot>
      </div>
    </BottomSheet>
  </div>
</template>

<script setup lang="ts">
import BottomSheet from '@douxcode/vue-spring-bottom-sheet'
import '@douxcode/vue-spring-bottom-sheet/dist/style.css'
import { ref, watch } from 'vue'

const bottomSheet = ref<InstanceType<typeof BottomSheet>>()

const open = () => {
  bottomSheet.value.open()
}

const close = () => {
  bottomSheet.value.close()
}

const props = defineProps<{
  light?: boolean,
  title?: string
}>();

watch(
  () => props.light,
  (val) => {
    if (!val) {
      document.documentElement.style.setProperty('--vsbs-background','rgba(38 38 38 / 1)')
    } else {
      document.documentElement.style.setProperty('--vsbs-background','#fff')
    }
  },
  { immediate: true }
)

defineExpose({
  open,
  close
});
</script>

