<script setup lang="ts">
import { onMounted } from 'vue';
import PWABadge from './components/PWABadge.vue';
import Layout from './layouts/default.vue';
import { useNotificationStore } from './stores/notificationStore';



if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', async event => {
    if (event.data && event.data.type === 'NEW_NOTIFICATION') {
      const notificationStore = useNotificationStore();
      await notificationStore.fetchNotifications();
      //notificationStore.setUnreadNotificationsBadge(notificationStore.unreadNotificationsCount);
    }
  });
}

onMounted(() => {
  const notificationStore = useNotificationStore();
  notificationStore.fetchNotifications();
});

// onBeforeRouteUpdate(() => {
//   const notificationStore = useNotificationStore();
//   notificationStore.fetchNotifications();
// });

</script>

<template>
  <Layout>
    <router-view v-slot="{ Component }">
      <component :is="Component" />
    </router-view>
    <PWABadge />
  </Layout>
</template>

<style>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}

.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.ptr--ptr {
  color: white; /* Kolor tekstu */
  text-align: center;
  padding: 20px;
}

.ptr--icon {
  color: white !important; /* Kolor ikony */
}

.ptr--text {
  color: white !important; /* Kolor tekstu */
}
</style>
