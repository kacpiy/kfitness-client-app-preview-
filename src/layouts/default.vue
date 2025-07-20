<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { initFlowbite } from 'flowbite';
import TheHeader from './TheHeader.vue';
import TheFooter from './TheFooter.vue';
import { useUserStore } from '@/stores/userStore';

onMounted(() => {
	initFlowbite();
})

const userStore = useUserStore();
const hideHeader = computed(() => userStore.data?.roles.includes('KIOSK_SOLARIUM') || !userStore.isAuthenticated);
</script>

<template>
  <div>
    
  </div>
</template>

