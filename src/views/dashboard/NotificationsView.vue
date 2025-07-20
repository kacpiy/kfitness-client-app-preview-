<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useNotificationStore } from '@/stores/notificationStore';
import { formatDistanceToNow } from 'date-fns';
import { pl } from 'date-fns/locale'; 

const notificationStore = useNotificationStore();

const loadData = async () => {
  await notificationStore.fetchNotifications();
}

const notifications = computed(() => {
  return notificationStore.notifications;
});

const unreadNotifications = computed(() => {
  return notificationStore.unreadNotifications;
});

const readNotifications = computed(() => {
  return notificationStore.readNotifications;
}); 

const expandedMessages = ref<number[]>([])

const isExpanded = (id: number): boolean =>
  expandedMessages.value.includes(id)

const toggleExpand = (id: number): void => {
  if (isExpanded(id)) {
    expandedMessages.value = expandedMessages.value.filter((i: number) => i !== id)
  } else {
    expandedMessages.value.push(id)
  }
}

const truncate = (text: string, maxLength: number = 75): string => {
  return text.length > maxLength ? text.slice(0, maxLength) + '...' : text
}

const formatRelativeTime = (date: Date) => {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: pl });
}

onMounted(async () => {
  await loadData();
  await notificationStore.markAllNotificationsAsRead();
});
</script>
<template>
  <div>
    <PullToRefresh @refresh="loadData()">
      <div class="px-4">
        <h1 class="text-xl font-bold mb-4">Powiadomienia</h1>
        <p class="text-center" v-if="!notifications.length">Wygląda na to, że nie otrzymałeś od nas jeszcze żadnych powiadomień ;)</p>
        <div v-else>
          <p class="text-center" v-if="!unreadNotifications.length">Nie masz żadnych nowych powiadomień</p>
          <div v-for="notification in unreadNotifications" :key="notification.id" class="p-3 mb-2 bg-neutral-900 rounded-md flex gap-4">
            <img src="/icon-64x64.png" class="w-8 h-8 rounded-md mx-auto mt-1" alt="App icon" />
            <div class="flex-1">
              <h2 class="mb-1 font-medium text-sm">{{ notification.title }}</h2>
              <p class="text-xs">{{ notification.message }}</p>
              <p class="text-xs mt-1">{{ formatRelativeTime(notification.createdAt) }}</p>
            </div>
          </div>
          <h1 class="text-lg font-medium mt-7 text-neutral-300">Wcześniejsze powiadomienia</h1>
          <div v-for="notification in readNotifications" :key="notification.id" class="py-3 border-b border-neutral-800 flex gap-4">
            <img src="/icon-64x64.png" class="w-8 h-8 rounded-md mx-auto opacity-50 mt-1" alt="App icon" />
            <div class="flex-1">
              <h2 class="mb-1 font-medium text-sm">{{ notification.title }}</h2>
              <p class="text-sm">
                <span class="mr-1 text-xs">{{ isExpanded(notification.id) ? notification.message : truncate(notification.message) }}</span>
                <button
                  class="text-xs text-primary-600 hover:underline"
                  v-if="notification.message.length > 75"
                  @click="toggleExpand(notification.id)"
                >
                  {{ isExpanded(notification.id) ? 'Zobacz mniej' : 'Zobacz więcej' }}
                </button>
              </p>
              
              <p class="text-xs mt-1 text-neutral-400">{{ formatRelativeTime(notification.createdAt) }}</p>
            </div>
          </div>
        </div>
      </div>
    </PullToRefresh>
  </div>
</template>