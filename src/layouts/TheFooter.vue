<script setup lang="ts">
import { useNotificationStore } from '@/stores/notificationStore';
import { computed } from 'vue';

const notificationStore = useNotificationStore();

const unreadNotificationsCount = computed(() => {
  return notificationStore.unreadNotificationsCount;
});
</script>
<template>
  <footer>
    
  </footer>
</template>

<style scoped>
.group {
	@apply inline-flex flex-col items-center justify-center px-5 py-3
}

.b-item {
	@apply mb-2 text-gray-400 group-hover:text-primary
}

.b-icon {
  @apply w-5 h-5
}

.b-desc {
	@apply text-xs text-gray-400
}

/* .router-link-exact-active {
	@apply bg-neutral-950
} */

.router-link-exact-active .b-item, .router-link-exact-active .b-desc {
	@apply text-primary
} 
</style>