<script setup lang="ts">
import { onMounted } from 'vue';
import TheButtton from '@/components/TheButton.vue';

import { useAccountStore } from '@/stores/accountStore';
const accountStore = useAccountStore();

onMounted(() => {
  accountStore.loadConnectionStatus();
});

</script>

<template>
    <div class="login-wrapper d-flex h-dvh py-12 px-4">
        <div class="flex flex-col h-full justify-between">
            <img src="/images/logo.png" alt="logo" class="w-1/2 mx-auto" />
            <div class="flex flex-col gap-3">
                <!-- <TheButtton type="secondary">Zostań klubowiczem</TheButtton> -->
                <!-- <TheButtton type="secondary">Wejście jednorazowe</TheButtton> -->
                <h4 class="mt-3 text-white text-center">Nie jesteś klubowiczem?</h4>
                <p class="text-neutral-300">Aplikacja nie wspiera jeszcze rejestracji nowych klubowiczów. Zarejestruj sie w klubie, a następnie połącz konto.</p>
                <h4 class="mt-3 text-white text-center" >Jesteś klubowiczem i chcesz połączyć konto?</h4> <!-- v-if="!accountStore.isLinked" -->
                <RouterLink to="/auth/link-account"><TheButtton variant="secondary">Połącz konto</TheButtton></RouterLink> <!-- v-if="!accountStore.isLinked" -->
                <h4 class="mt-3 text-white text-center">Masz już konto?</h4> <!-- v-if="!accountStore.isLinked" -->
                <RouterLink to="/auth/login"><TheButtton variant="primary">Zaloguj się</TheButtton></RouterLink>
            </div>
        </div>
    </div>
</template>

<style scoped>
.login-wrapper {
    background-image: url('/images/auth/silhouette-basketball-player-holding-ball-black-background-min.jpg');
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;
}

input {
    margin-bottom: 1rem;
}


</style>