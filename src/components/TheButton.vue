<script setup lang="ts">
defineProps<{
  variant: 'primary' | 'secondary' | 'back',
  sm?: boolean,
  disabled?: boolean
}>();
</script>

<template>
  <button 
    type="button" 
    :disabled="disabled" 
    class="rounded-md w-full font-medium transition duration-100 ease-in-out"
    :class="{
      'text-lg p-2': !sm,
      'p-1': sm,
      'text-black bg-gradient-to-r bg-primary-500 hover:opacity-90': variant === 'primary' && !disabled,
      'text-gray-100 border-2 border-primary-500 bg-black': variant === 'secondary' && !disabled,
      'text-gray-500 bg-gray-400 cursor-not-allowed': disabled
    }"
  >
    <slot v-if="variant !== 'back'"></slot>
    <div v-if="variant === 'back'" class="flex items-center gap-1 text-gray-100">
      <svg class="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m15 19-7-7 7-7"/>
      </svg>
      Wróć
    </div>
  </button>
</template>
