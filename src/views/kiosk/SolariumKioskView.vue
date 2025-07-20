<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useUserStore } from '@/stores/userStore';
import TheBottomDrawer from '@/components/TheBottomDrawer.vue';
import Stepper from 'primevue/stepper';
import StepList from 'primevue/steplist';
import StepPanels from 'primevue/steppanels';
import Step from 'primevue/step';
import StepPanel from 'primevue/steppanel';
import Button from 'primevue/button';
import apiClient from '@/axios';
import ProgressSpinner from 'primevue/progressspinner';
import { SolariumPass } from '@/interfaces/solarium-pass';
import { Solarium } from '@/interfaces/solarium';

const userStore = useUserStore();
const user = computed(() => userStore.data);
const currentStep = ref("1");
const intervalInstance = ref<any>(null);

const selectedSolariumPass = ref<SolariumPass | null>(null);
const waiting = ref(false);
const errorMessage = ref<string | null>(null);

const drawer = ref<DrawerInstance | null>(null);

watch(currentStep, async (value: string) => {
  if (value === '4') {
    await useSolariumPass();
  }
});

const useSolariumPass = async () => {
  waiting.value = true;
  errorMessage.value = null;
  setTimeout(async () => {
    try {
      const response = await apiClient.patch(`/solarium-pass/${selectedSolariumPass.value!.id}/use`, {
        solariumCode: solarium.value?.code
      });

      if (response.data.success) {
        selectedSolariumPass.value!.used = true;
      } else {
        errorMessage.value = response.data.message || 'Nie udało się użyć karnetu.';
      }
      setTimeout(() => {
        drawer.value?.hide();
      }, (selectedSolariumPass.value!.duration * 1000) + (2 * 60 * 1000));
    } catch (error) {
      console.error('Error using solarium pass:', error);
    }
    finally {
      waiting.value = false;
    }
  }, 5000);
}

const selectSolariumPass = (id: number) => {
  selectedSolariumPass.value = solariumPasses.value.find(pass => pass.id === id)!;
  currentStep.value = '1';
  drawer.value?.show()
}

const solariumPasses = ref<SolariumPass[]>([]);
const fetchSolariumPasses = async () => {
  try {
    const response = await apiClient.get<SolariumPass[]>('/solarium-pass/me');
    const data = response.data;

    solariumPasses.value = data;
  } catch (error) {
    console.error('Error fetching solarium passes data:', error);
  }
}

const availableSolariumPasses = computed(() => solariumPasses.value.filter(pass => !pass.used));

const solarium = ref<Solarium | undefined>(undefined);
const fetchSolarium = async () => {
  try {
    const response = await apiClient.get<Solarium>('/solarium/code/'+user.value?.phone);
    const data = response.data;

    solarium.value = data;
  } catch (error) {
    console.error('Error fetching solariums data:', error);
  }
}

const loadData = () => {
  fetchSolariumPasses();
  fetchSolarium();
}

onMounted(() => {
  loadData();
  intervalInstance.value = setInterval(() => {
    fetchSolariumPasses();
  }, 5000);
});

onUnmounted(() => {
  intervalInstance.value && clearInterval(intervalInstance.value);
});
</script>

<template>
  <div>
    <PullToRefresh @refresh="() => loadData()">
      <div class="px-4 overflow-hidden" v-if="solarium && user">
        <img src="/images/logo.png" alt="logo" class="w-[250px] mx-auto mt-10" />
        <div class="mt-8 flex flex-col justify-center items-center">
          <!-- <font-awesome-icon 
              :icon="['fas', 'location-dot']" 
              :class="solarium.status === 'online' ? 'text-lime-500' : 'text-red-500'"
              size="2xl"/> -->
          <h1 class="text-6xl font-bold my-2 text-center">{{ solarium.description }}</h1>
          <p class="text-center text-neutral-200 text-lg">Kod solarium: {{ user.phone }}</p>
        </div>
        
        <!-- Legenda!-->
    
        <!-- <div class="flex gap-2 mt-3 text-neutral-200">
          <p>Legenda:</p>
          <p>
            <font-awesome-icon :icon="['fas', 'location-dot']" class="mx-auto mr-1 text-lime-500" size="lg"/>
            Aktywne
          </p>
          <p>
            <font-awesome-icon :icon="['fas', 'location-dot']" class="mx-auto mr-1 text-red-500" size="lg"/>
            Nieaktywne
          </p>
        </div> -->
        <div class="overflow-x-auto flex gap-4 mt-10 justify-center" v-if="availableSolariumPasses.length">
          <div v-for="pass in availableSolariumPasses" 
            :key="pass.id" 
            @click="selectSolariumPass(pass.id)" 
            class="p-4 bg-neutral-900 border-2 rounded-md text-center flex flex-col gap-3 w-[300px] flex-shrink-0">
            <font-awesome-icon :icon="['fas', 'sun']" class="text-primary-500 mx-auto mb-2" size="2xl"/>
            <div class="flex flex-col">
              <h1 class="text-6xl font-medium">{{ (pass.duration/60).toFixed(0) }}</h1>
              <p class="text-2xl">minut</p>
            </div>
            <p class="text-xl">Wybierz ten karnet, aby rozpocząć</p>
          </div>
        </div>
        <div v-else class="mt-10">
          <p class="text-center text-red-400 mt-2 text-3xl">Brak dostępnych karnetów.</p>
          <p class="text-center text-neutral-200 mt-5 text-2xl ">Karnety na solarium możesz zakupić w recepcji klubu lub kontaktując się z nami przez stronę na facebooku</p>
        </div>
        <!-- <p class="text-neutral-400 mt-7 text-lg">
          Informujemy, że zgodnie z obowiązującymi przepisami osoby niepełnoletnie nie mogą korzystać z solarium. 
          Przed skorzystaniem z usługi może być wymagane okazanie dokumentu tożsamości w celu potwierdzenia wieku na aplikacji. 
          Dziękujemy za zrozumienie i przestrzeganie zasad bezpieczeństwa.
        </p> -->
        <div class="p-4">
          <h1 class="text-5xl mt-10">Jak zacząć?</h1>
          <ol class="flex flex-col gap-6 list-decimal text-3xl mt-8 ps-10">
            <li class="font-medium">Wybierz dostępny karnet na solarium</li>
            <li>Przeczytaj zasady korzystania z solarium</li>
            <li>Zapoznaj się z informacjami</li>
            <li>Rozpocznij sesję w solarium</li>
          </ol>
        </div>
      </div>
    </PullToRefresh>
    <TheBottomDrawer ref="drawer" :header="false" :title="'Korzystanie z solarium'" class="">
      <Stepper :value="currentStep" linear @update:value="currentStep = $event" v-if="selectedSolariumPass">
        <StepList>
          <Step value="1"></Step>
          <Step value="2"></Step>
          <Step value="3"></Step>
          <Step value="4"></Step>
        </StepList>
        <StepPanels>
          <StepPanel v-slot="{ activateCallback }" value="1" class="bg-transparent text-slate-200">
            <div class="flex flex-col gap-3 min-h-[500px] rounded-xl px-4 items-center">
              <p class="text-4xl mb-3">Zasady korzystania z solarium</p>
              <ol class="flex flex-col gap-2 list-decimal text-2xl">
                <li class="font-medium">Po każdym użyciu zdezynfekuj wnętrze środkiem dostępnym w solarium.</li>
                <li>Korzystaj z solarium bez makijażu, perfum i kosmetyków, które mogą reagować na promieniowanie UV.</li>
                <li>Nie przekraczaj zalecanego czasu dostosowanego do Twojego typu skóry.</li>
                <!-- <li>Zawsze używaj okularów ochronnych, aby zabezpieczyć wzrok.</li> -->
                <li>Nie korzystaj z solarium, jeśli masz problemy skórne, przyjmujesz leki światłouczulające lub masz przeciwwskazania medyczne.</li>
                <li>Korzystaj bez biżuterii i odzieży, aby uniknąć nierównej opalenizny.</li>
                <li>W przypadku złego samopoczucia natychmiast opuść solarium i zgłoś sytuację obsłudze.</li>
              </ol>
            </div>
            <div class="flex pt-6 justify-end"> 
                <Button class="text-4xl p-5" label="Dalej" icon="pi pi-arrow-right" iconPos="right" @click="activateCallback('2')"/>
            </div>
          </StepPanel>
          <StepPanel v-slot="{ activateCallback }" value="2" class="bg-transparent text-slate-200">
            <div class="flex flex-col gap-3 min-h-[500px] rounded-xl px-4 items-center">
              <p class="text-4xl mb-10">Wszystko już prawie gotowe!</p>
              <p class="text-center text-2xl">Za chwilę rozpocznie się sesja w solarium. Upewnij się, że:</p>
              <ul class="flex flex-col gap-1 list-disc text-2xl">
                <li>Jesteś gotowy do wejścia - masz zdjętą biżuterię itp.</li>
                <li>Solarium jest zdezynfekowane i czyste</li>
              </ul>
              <p class="text-center text-3xl font-medium mt-10 mb-8 text-red-400">⚠<br>Uwaga! Jeśli poczujesz dyskomfort, możesz w każdej chwili przerwać sesję otwierając drzwi solarium.</p>
            </div>
            <div class="flex pt-6 justify-between">
                <Button class="text-4xl p-5" label="Wróć" severity="secondary" icon="pi pi-arrow-left" @click="activateCallback('1')" size="large" />
                <Button class="text-4xl p-5" label="Dalej" icon="pi pi-arrow-right" iconPos="right" @click="activateCallback('3')" size="large" />
            </div>
          </StepPanel>
          <StepPanel v-slot="{ activateCallback }" value="3" class="bg-transparent text-slate-200">
            <div class="flex flex-col gap-3 min-h-[500px] rounded-xl px-4 items-center">
              <p class="text-4xl mb-10">Jesteś gotowy/a?</p>
              <p class="text-center text-3xl mb-5">Naciśnij przycisk „Start”</p>
              <p class="text-center text-3xl mb-10">Po 5 sekundach lampy solarium włączą się automatycznie.</p>
              <Button class="text-5xl p-8 bg-primary-500 text-black" label="Start" @click="activateCallback('4')" size="large" />
            </div>
            <div class="flex pt-6 justify-between">
                <Button class="text-4xl p-5" label="Wróć" severity="secondary" icon="pi pi-arrow-left" @click="activateCallback('2')" size="large" />
            </div>
          </StepPanel>
          <StepPanel value="4" class="bg-transparent text-slate-200">
            <div class="flex flex-col gap-6 min-h-[500px] rounded-xl px-4 items-center" v-if="!waiting">
              <div
                v-if="errorMessage"
                class="mt-6 p-6 text-center max-w-2xl mx-auto"
              >
                <font-awesome-icon :icon="['fas', 'exclamation-triangle']" class="text-red-400 text-6xl mb-6" />
                <h3 class="text-red-300 text-4xl font-semibold mb-4">Przepraszamy!</h3>
                <p class="text-red-200 text-2xl mb-8">
                  Wystąpił nieoczekiwany błąd podczas uruchamiania solarium.
                </p>
                <button 
                  @click="useSolariumPass()"
                  class="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-lg text-xl font-medium transition-colors mb-6"
                >
                  <font-awesome-icon :icon="['fas', 'redo-alt']" class="mr-3" />
                  Spróbuj ponownie
                </button>
                <p class="text-slate-400 text-lg mt-6">
                  Jeśli problem się powtarza, skontaktuj się z obsługą
                </p>
              </div>
              <div v-else>
                <p class="text-4xl text-center">🌞</p>
                <p class="text-4xl text-center">Dziękujemy za skorzystanie z solarium!</p>
                <ul class="flex flex-col gap-1 list-disc text-2xl">
                  <li>Pamiętaj o dezynfekcji solarium po użyciu 🧴</li>
                  <li>Regularne korzystanie z solarium z umiarem pozwala cieszyć się zdrową opalenizną 🌿</li>
                </ul>
                <p class="text-4xl mt-10">Zapraszamy ponownie!</p>
              </div>
            </div>
            <div class="flex flex-col gap-6 min-h-[500px] rounded-xl px-4 items-center" v-else>
              <p class="text-center text-4xl mb-5">Solarium za chwilę zostanie uruchomione...</p>
              <ProgressSpinner  />
            </div>
          </StepPanel>
        </StepPanels>
      </Stepper>
    </TheBottomDrawer>
  </div>
</template>

<style scoped>
</style>