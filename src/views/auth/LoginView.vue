<script setup lang="ts">
import { ref, watch } from "vue";
import { useRouter } from 'vue-router';

import apiClient from "@/axios";
import { useUserStore } from '@/stores/userStore';
import TheButtton from "@/components/TheButton.vue";

import IconField from 'primevue/iconfield';
import InputText from 'primevue/inputtext';
import InputIcon from 'primevue/inputicon';
import Password from 'primevue/password';

const phone = ref<string>('');
const password = ref<string>('');

const authError = ref<boolean>(false);

const userStore = useUserStore();
const router = useRouter();

const submitForm = async () => {
  try {
    phone.value = phone.value.trim();
    const response = await apiClient.post('/auth/login', {
      phone: phone.value,
      password: password.value,
    });

    if (response.status === 200) {
      const { accessToken, refreshToken } = response.data;

      await userStore.login(accessToken, refreshToken);
      router.push('/');
    }
  } catch (error: any) {
    if (error.response && error.response.status === 401) {
      authError.value = true; // Zmienna sygnalizująca błąd autoryzacji
    } else {
      console.error('An unexpected error occurred:', error); // Obsługa innych błędów
    }
  }
};

watch(phone, (newValue) => {
  phone.value = newValue.replace(/\s+/g, '');
});
</script>

<template>
	<div class="flex flex-col h-dvh pb-10">
    <div class="mt-2">
      <RouterLink to='/auth'><TheButtton variant="back"/></RouterLink>
    </div>
    <div class="px-3 flex flex-col ">
      <h1 class="mt-5 text-3xl font-bold text-gray-100">Zaloguj się</h1>
      <form class="mt-5 flex flex-col justify-between gap-3 w-full" @submit.prevent="submitForm">
        <div>
          <label for="phone" class="block mb-2 text-sm font-medium text-gray-100">Numer telefonu</label>
          <IconField>
              <InputIcon class="pi pi-phone" />
              <InputText
              id="phone"
              name="username"
              class="w-full"
              v-model.trim="phone"
              autocomplete="username" 
              type="tel"
              autofocus
              required
                 />
          </IconField>
        </div>
				<div>
          <label for="password" class="block mb-2 text-sm font-medium text-gray-100">Hasło</label>
          <Password v-model="password" id="password" name="password" autocomplete="current-password" toggleMask :feedback="false" required/>
          <div class="ms-auto mt-2">
            <RouterLink to='/auth/link-account?reset-password'><button class="text-sm text-gray-100" type="button">Zapomniałeś hasła?</button></RouterLink>
          </div>
        </div>
				<p v-if="authError" class="error-explanation">Nieprawidłowy numer telefonu lub hasło</p>
				
        <div class="mt-5">
          <TheButtton variant="primary" type="submit" class="w-full">Zaloguj się</TheButtton>
        </div>
      </form>
		</div>
  </div>
</template>

<style scoped>
.input-error {
  @apply bg-red-50 border-red-500 text-red-900 placeholder-red-700
}

.error-explanation {
  @apply text-red-500 font-medium mt-2 text-sm
}

.p-password {
  @apply w-full
}

::v-deep(.p-password-input) {
  @apply w-full
}
</style>
