<script setup lang="ts">
import { onMounted } from 'vue';
import { initFlowbite } from 'flowbite';

// import { useUserStore } from '../stores/userStore';
// const userStore = useUserStore();


// const logout = () => {
// 	userStore.logout();
// }

onMounted(() => {
	initFlowbite();
})

</script>

<template>
  <nav>
    
  </nav>
</template>