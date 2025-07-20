<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import TheButton from '@/components/TheButton.vue';
import { useAccountStore } from '@/stores/accountStore';
import apiClient from '@/axios';

import IconField from 'primevue/iconfield';
import InputText from 'primevue/inputtext';
import InputIcon from 'primevue/inputicon';
import InputOtp from 'primevue/inputotp';
import Password from 'primevue/password';

const accountStore = useAccountStore();
const step = ref(1);

const phone = ref('');
const code = ref('');
const password = ref('');
const passwordConfirm = ref('');

const phoneError = ref<string | null>(null);
const codeError = ref<string | null>(null);
const passwordError = ref<string | null>(null);

const route = useRoute();

const submitForm = async () => {
  if (step.value === 1) {
    const event = route.query['reset-password'] !== undefined ? 'reset-password' : 'link-account';
    try {
      apiClient.post('/auth/send-verification-code', { phone: phone.value.trim(), event: event });
      step.value = 2;
      phoneError.value = null;
    } catch (error: any) {
      console.error(error);
      phoneError.value = error.response.data?.message.join('<br>');
      document.getElementById('phone')?.focus();
    }
  } else if(step.value === 2) {
    try {
      const response = await apiClient.post('/auth/verify-code', { phone: phone.value.trim(), code: code.value });
      if (response.status === 200) {
        step.value = 3; 
      }
    } catch (error: any) {
      if (error.response && error.response.status === 403) {
        codeError.value = 'Podany kod jest nieprawidłowy';
      } else {
        codeError.value = error.response.data?.message;
      }
    }
  } else if(step.value === 3) {
    if (password.value !== passwordConfirm.value) {
      passwordError.value = 'Podane hasła różnią się od siebie';
      return;
    }
    try {
      const response = await apiClient.post('/auth/link-account/password', { 
        phone: phone.value.trim(), 
        code: code.value, 
        password: password.value, 
        passwordConfirm: passwordConfirm.value 
      });
      if (response.status === 200) {
        connectAccount();
        step.value = 4;
      }
    } catch (error: any) {
      passwordError.value = error.response.data?.message;
    }
  }
}

const connectAccount = () => {
  accountStore.connectAccount();
};

watch(phone, (newValue) => {
  phone.value = newValue.replace(/\s+/g, '');
});
</script>

<template>
  
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