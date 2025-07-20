<script setup lang="ts">
import { format } from 'date-fns';
import { useUserStore } from '@/stores/userStore';
const userStore = useUserStore();
</script>

<template>
  <div class="px-4 mt-2">
    <div class="flex gap-3 items-end content-center">
      <div class="relative w-16 h-16 overflow-hidden bg-neutral-900 rounded-full cursor-pointer" type="button" data-dropdown-toggle="userDropdown" data-dropdown-placement="bottom-start">
        <svg class="absolute w-20 h-20 text-primary/90 -left-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path></svg>
      </div>
      <div class="flex flex-col">
        <h1 class="text-2xl font-medium">{{ userStore.data?.name}} {{ userStore.data?.surname }}</h1>
        <p class="text-sm text-neutral-400">Klubowicz</p>
      </div>
    </div>
    <div class="flex flex-col mt-7 personal-data-items">
      <div class="bg-neutral-900 p-3">
        <div class="flex justify-content-around items-center">
          <div class="flex items-center gap-2 flex-1">Data urodzenia</div>
          <div class="text-neutral-400" v-if="userStore.data?.birthday">{{ format( new Date(userStore.data?.birthday as Date), 'dd.MM.yyyy')+'r.' || '-'}}</div>
          <div class="text-neutral-400" v-else>-</div>
        </div>
      </div>
      <div class="bg-neutral-900 p-3">
        <div class="flex justify-content-around items-center">
          <div class="flex items-center gap-2 flex-1">Numer telefonu</div>
          <div class="text-neutral-400">{{ userStore.data?.phone }}</div>
        </div>
      </div>
      <div class="bg-neutral-900 p-3">
        <div class="flex justify-content-around items-center">
          <div class="flex items-center gap-2 flex-1">E-mail</div>
          <div class="text-neutral-400">{{ userStore.data?.mail }}</div>
        </div>
      </div>
    </div>
    <div class="mt-5">
      <div class="bg-neutral-900 p-3 rounded-md cursor-pointer" @click="userStore.logout()">
        <div class="text-red-500 text-center">
          Wyloguj się
        </div>
      </div>
    </div>
    <div class="mt-5">
      <div class="mb-3 text-neutral-400">
				<p class="text-sm">Zauważyłeś/aś błąd w aplikacji?<br>Napisz do mnie na <a href="mailto:biuro@kcode.pl" class="text-sky-600">biuro@kcode.pl</a> ;)</p>
			</div>
      <p class="text-xs text-neutral-400 text-center">kFitness v1.5-2025.07.08 by kCode Kacper Dąbrowa</p>
    </div>
  </div>
</template>

<style scoped>
.personal-data-items > div:not(:last-child) {
  @apply border-b border-neutral-800;
}

.personal-data-items > div:first-child {
  @apply rounded-t-md;
}

.personal-data-items > div:last-child {
  @apply rounded-b-md;
}


</style>