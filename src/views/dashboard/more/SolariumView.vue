<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import TheButton from '@/components/TheButton.vue';
import TheBottomDrawer from '@/components/TheBottomDrawer.vue';
import Select from 'primevue/select';
import IftaLabel from 'primevue/iftalabel';
import Stepper from 'primevue/stepper';
import StepList from 'primevue/steplist';
import StepPanels from 'primevue/steppanels';
import Step from 'primevue/step';
import StepPanel from 'primevue/steppanel';
import Button from 'primevue/button';
import apiClient from '@/axios';
import ProgressSpinner from 'primevue/progressspinner';
import VueCountdown from '@chenfengyuan/vue-countdown';
import { SolariumPass } from '@/interfaces/solarium-pass';
import { Solarium } from '@/interfaces/solarium';
import { format } from 'date-fns';
// import { pl } from 'date-fns/locale';

const currentStep = ref("1");
const inputOtp = ref<any>(null);

const solariums = ref<Solarium[]>([]);
const solariumPasses = ref<SolariumPass[]>([]);

const selectedCity = ref<string | null>(null);
const selectedSolariumCode = ref<string | null>(null);

const selectedSolariumPass = ref<SolariumPass | null>(null);
const selectedSolarium = ref<Solarium | null>(null);

const waiting = ref(false);
const errorMessage = ref<string | null>(null);

const solariumStartTime = ref<number | null>(null)
const solariumTimer = ref<NodeJS.Timeout | null>(null)
const updateTimer = ref<NodeJS.Timeout | null> (null)
const currentTime = ref<number> (Date.now())

const drawer = ref<DrawerInstance | null>(null);

watch(currentStep, async (value: string) => {
  if(value === '3') {
    setTimeout(() => inputOtp.value?.$el?.querySelector('input')?.focus(), 100);
  }
  if (value === '5') {
    await useSolariumPass();
  }
});

const isSolariumActive = computed((): boolean => {
  if (!solariumStartTime.value || !selectedSolariumPass.value?.duration) {
    return false
  }
  
  const elapsed = (currentTime.value - solariumStartTime.value) / 1000
  return elapsed < selectedSolariumPass.value.duration
})

const remainingTime = computed((): number => {
  if (!solariumStartTime.value || !selectedSolariumPass.value?.duration) {
    return 0
  }
  
  const elapsed = (currentTime.value - solariumStartTime.value) / 1000
  const remaining = Math.max(0, selectedSolariumPass.value.duration - elapsed)
  return Math.ceil(remaining)
})

const formattedRemainingTime = computed((): string => {
  const totalSeconds = remainingTime.value
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
})

const startTimer = (): void => {
  const updateTime = () => {
    currentTime.value = Date.now()
    
    if (isSolariumActive.value) {
      updateTimer.value = setTimeout(updateTime, 100)
    }
  }
  
  updateTime()
}

const stopTimer = (): void => {
  if (updateTimer.value) {
    clearInterval(updateTimer.value)
    updateTimer.value = null
  }
}

const useSolariumPass = async () => {
  waiting.value = true;
  errorMessage.value = null;

  setTimeout(async () => {
    try {
      const response = await apiClient.patch(`/solarium-pass/${selectedSolariumPass.value!.id}/use`, {
        solariumCode: selectedSolarium.value!.code,
      });

      if (response.data.success) {
        selectedSolariumPass.value!.used = true;
        solariumStartTime.value = Date.now();
        currentTime.value = Date.now()

        startTimer()

        if (selectedSolariumPass.value?.duration) {
          solariumTimer.value = setTimeout(() => {
            solariumStartTime.value = null
            stopTimer()
          }, selectedSolariumPass.value.duration * 1000)
        }
      } else {
        errorMessage.value = response.data.message || 'Nie udało się użyć karnetu.';
      }

    } catch (error) {
      console.error('Error using solarium pass:', error);
    } finally {
      waiting.value = false;
    }
  }, 5000);
}

const emergencyStop = async (): Promise<void> => {
  try {
    await apiClient.patch(`/solarium-pass/${selectedSolariumPass.value!.id}/stop`);

    solariumStartTime.value = null;

    if (solariumTimer.value) {
      clearTimeout(solariumTimer.value);
      solariumTimer.value = null;
    }

    stopTimer()

    console.log('Awaryjne wyłączenie solarium')
  } catch (error) {
    console.error('Error stopping solarium pass:', error);
  }
}

const selectSolariumPass = (id: number) => {
  selectedSolariumPass.value = solariumPasses.value.find(pass => pass.id === id)!;
  currentStep.value = '1';
  selectedCity.value = null;
  selectedSolariumCode.value = null;
  
  selectedSolarium.value = null;
  drawer.value?.show()
}


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


const fetchSolariums = async () => {
  try {
    const response = await apiClient.get<Solarium[]>('/solarium?withState=true');
    const data = response.data;

    solariums.value = data;
    console.log(data)
  } catch (error) {
    console.error('Error fetching solariums data:', error);
  }
}

const getRemainingTime = (busyUntil: string): number => {
  const now = new Date();
  const busyUntilDate = new Date(busyUntil);
  return busyUntilDate.getTime() - now.getTime();
}

const transformSlotProps = (props: any)=>  {
  const formattedProps = {};

  Object.entries(props).forEach(([key, value]) => {
    //@ts-ignore
    formattedProps[key] = value < 10 ? `0${value}` : String(value);
  });

  return formattedProps;
}

const changeState = (id: number) => {
  solariums.value.find((solarium) => solarium.id === id)!.state!.busy = false;
}

const citiesOptions = computed(() => {
  const uniqueCities = new Set<string>();
  solariums.value.forEach((solarium) => {
    uniqueCities.add(solarium.location.city);
  });
  return Array.from(uniqueCities).map((city) => ({ city: city, value: city }));
});

const solariumOptions = computed(() => {
  if (!selectedCity.value) return [];

  const filtered = solariums.value.filter(
    (solarium) => solarium.location.city === selectedCity.value
  );

  return filtered.map((solarium) => ({
    description: solarium.description,
    value: solarium.code,
  }));
});

watch(selectedSolariumCode, (newCode) => {
  if (newCode) {
    selectedSolarium.value = solariums.value.find((solarium) => solarium.code === newCode) || null;
    console.log("Selected Solarium:", selectedSolarium.value);
  } else {
    selectedSolarium.value = null;
  }
});

watch(selectedCity, () => {
  selectedSolariumCode.value = null;
  selectedSolarium.value = null;
});

const loadData = () => {
  fetchSolariumPasses();
  fetchSolariums();
}

onMounted(() => {
  loadData();

  if (solariumStartTime.value) {
    startTimer()
  }
});

onUnmounted(() => {
  if (solariumTimer.value) {
    clearTimeout(solariumTimer.value);
  }
  stopTimer();
});
</script>

<template>
  <div>
    <PullToRefresh @refresh="() => loadData()">
      <div class="px-4 overflow-hidden">
        <h1 class="text-xl font-bold mb-4">Solarium</h1>
        <p class="mb-2">Dostępne lokalizacje</p>
        <!-- 3 cardy z dostępnymi lokalizacjami -->
        <div class="grid grid-cols-3 gap-2">
          <div class="p-4 bg-neutral-900 rounded-md flex flex-col gap-2 items-center text-center text-sm" v-for="solarium in solariums" :key="solarium.id">
            <font-awesome-icon 
              :icon="['fas', 'location-dot']" 
              :class="solarium.status === 'online' ? 'text-lime-500' : 'text-red-500'"
              size="lg"/>
            <p>{{ solarium.location.city }}</p> 
            <p class="text-neutral-300">{{ solarium.description }}</p>
            <p class="text-xs" v-if="solarium.status === 'online'">
              <font-awesome-icon 
              :icon="['fas', 'circle']"
              class="me-1"
              :class="solarium.state?.busy ? 'text-amber-500' : 'text-lime-500'"
              size="sm"/>
              <vue-countdown v-if="solarium.state?.busy" :transform="transformSlotProps" :time="getRemainingTime(solarium.state.busyUntil!)" v-slot="{ minutes, seconds }" @end="changeState(solarium.id)">
                {{ minutes }}:{{ seconds }}
              </vue-countdown>
              <span v-else>Wolne</span>
            </p>
          </div>
        </div>
        <!-- Legenda!-->
        
        <div class="flex gap-2 mt-3 text-neutral-200">
          <p class="text-xs">
            Legenda:
          </p>
          <p class="text-xs">
            <font-awesome-icon :icon="['fas', 'location-dot']" class="mx-auto mr-1 text-lime-500" size="sm"/>
            Aktywne
          </p>
          <p class="text-xs">
            <font-awesome-icon :icon="['fas', 'location-dot']" class="mx-auto mr-1 text-red-500" size="sm"/>
            Nieaktywne
          </p>
        </div>
        <p class="mt-6">Twoje karnety na solarium ({{ availableSolariumPasses.length }})</p>
        <div class="overflow-x-auto flex gap-4 mt-2" v-if="availableSolariumPasses.length">
          <div v-for="pass in availableSolariumPasses" :key="pass.id" class="p-4 bg-neutral-900 rounded-md text-center flex flex-col gap-3 w-[150px] flex-shrink-0">
            <font-awesome-icon :icon="['fas', 'sun']" class="text-primary-500 mx-auto" size="xl"/>
            <div class="flex flex-col">
              <h1 class="text-3xl font-medium">{{ (pass.duration/60).toFixed(0) }}</h1>
              <p>minut</p>
            </div>
            <p class="text-xs text-neutral-300">Data zakupu: {{ format( pass.orderDate, 'dd.MM.yyyy')+'r.' }}</p>
            <TheButton sm variant="primary" class="mt-2" @click="selectSolariumPass(pass.id)">Wybierz</TheButton>
          </div>
        </div>
        <div v-else>
          <p class="text-center text-neutral-200 mt-2">Brak dostępnych karnetów.</p>
          <p class="text-center text-neutral-200 mt-2 text-sm">Karnety na solarium możesz zakupić w recepcji klubu lub kontaktując się z nami przez stronę na facebooku</p>
        </div>
        <p class="text-xs text-neutral-400 mt-7">
          Informujemy, że zgodnie z obowiązującymi przepisami osoby niepełnoletnie nie mogą korzystać z solarium. 
          Przed skorzystaniem z usługi może być wymagane okazanie dokumentu tożsamości w celu potwierdzenia wieku na aplikacji. 
          Dziękujemy za zrozumienie i przestrzeganie zasad bezpieczeństwa.
        </p>
      </div>
    </PullToRefresh>
    <TheBottomDrawer ref="drawer" :header="false" :title="'Korzystanie z solarium'" class="">
      <Stepper :value="currentStep" linear @update:value="currentStep = $event" v-if="selectedSolariumPass">
        <StepList>
          <Step value="1"></Step>
          <Step value="2"></Step>
          <Step value="3"></Step>
          <Step value="4"></Step>
          <Step value="5"></Step>
        </StepList>
        <StepPanels>
          <StepPanel v-slot="{ activateCallback }" value="1" class="bg-transparent text-slate-200">
            <div class="flex flex-col gap-3 min-h-72 rounded-xl px-4 items-center">
              <p class="text-lg">Zasady korzystania z solarium</p>
              <ol class="text-xs flex flex-col gap-2 list-decimal">
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
                <Button label="Dalej" icon="pi pi-arrow-right" iconPos="right" @click="activateCallback('2')" />
            </div>
          </StepPanel>
          <StepPanel v-slot="{ activateCallback }"  value="2" class="bg-transparent text-slate-200">
            <div class="flex flex-col gap-3 min-h-72 rounded-xl px-4 items-center">
              <p class="text-lg">Wybrany karnet</p>
              <div class="p-4 bg-neutral-900 rounded-md text-center flex flex-col gap-3 w-[150px] flex-shrink-0">
                <font-awesome-icon :icon="['fas', 'sun']" class="text-primary-500 mx-auto" size="xl"/>
                <div class="flex flex-col">
                  <h1 class="text-3xl font-medium">{{(selectedSolariumPass.duration/60).toFixed(0)}}</h1>
                  <p>minut</p>
                </div>
                <p class="text-xs text-neutral-300">Data zakupu: {{ format( selectedSolariumPass.orderDate, 'dd.MM.yyyy')+'r.' }}</p>
              </div>
            </div>
            <div class="flex pt-6 justify-between">
                <Button label="Wróć" severity="secondary" icon="pi pi-arrow-left" @click="activateCallback('1')" />
                <Button label="Dalej" icon="pi pi-arrow-right" iconPos="right" @click="activateCallback('3')" />
            </div>
          </StepPanel>
          <StepPanel v-slot="{ activateCallback }" value="3" class="bg-transparent text-slate-200">
            <div class="flex flex-col gap-3 min-h-72 rounded-xl px-4 items-center">
              
            </div>
            <div class="flex pt-6 justify-between">
                <Button label="Wróć" severity="secondary" icon="pi pi-arrow-left" @click="activateCallback('2')" />
                <Button label="Dalej" icon="pi pi-arrow-right" iconPos="right" @click="activateCallback('4')" :disabled="!selectedSolarium || selectedSolarium.status !== 'online'" />
            </div>
          </StepPanel>
          <StepPanel v-slot="{ activateCallback }" value="4" class="bg-transparent text-slate-200">
            
            <div class="flex pt-6 justify-between">
                <Button label="Wróć" severity="secondary" icon="pi pi-arrow-left" @click="activateCallback('3')" />
                <Button label="Start" icon="pi pi-arrow-right" iconPos="right" @click="activateCallback('5')" />
            </div>
          </StepPanel>
          <StepPanel value="5" class="bg-transparent text-slate-200">
            <div class="flex flex-col gap-3 min-h-72 rounded-xl px-4 items-center" v-if="!waiting">
              <div
                v-if="errorMessage"
                class="mt-6 p-6 text-center max-w-md mx-auto"
              >
                <font-awesome-icon :icon="['fas', 'exclamation-triangle']" class="text-red-400 text-3xl mb-3" />
                <h3 class="text-red-300 text-lg font-semibold mb-2">Przepraszamy!</h3>
                <p class="text-red-200 text-sm mb-4">
                  Wystąpił nieoczekiwany błąd podczas uruchamiania solarium.
                </p>
                <button 
                  @click="useSolariumPass()"
                  class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <font-awesome-icon :icon="['fas', 'redo-alt']" class="mr-2" />
                  Spróbuj ponownie
                </button>
                <p class="text-slate-400 text-xs mt-3">
                  Jeśli problem się powtarza, skontaktuj się z obsługą
                </p>
              </div>
              <div v-else-if="isSolariumActive" class="text-center mx-auto">
                <p class="text-lg text-center mb-2">⚡ Solarium jest aktywne</p>
                <p class="text-center">Sesja w trakcie - pozostało {{ formattedRemainingTime }}</p>
                
                <button 
                  @click="emergencyStop()"
                  class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors mt-4"
                >
                  <font-awesome-icon :icon="['fas', 'power-off']" class="mr-2" />
                  Zakończ sesję
                </button>
                
                <p class="text-sm text-slate-400 mt-3 text-center">Lampy solarium zostaną wyłączone</p>
              </div>
              <div v-else class="text-center mx-auto">
                <p class="text-lg mb-2">🌞 Sesja zakończona</p>
                <p class="text-sm text-center">Twoja sesja dobiegła końca.</p>
                <p class="text-sm text-center">Dziękujemy za skorzystanie z naszych usług</p>
                
                <div class="mt-3">
                  <p class="mb-1 text-xs">Pamiętaj o dezynfekcji solarium po użyciu 🧴</p>
                  <p class="mb-1 text-xs">Regularne korzystanie z solarium z umiarem pozwala cieszyć się zdrową opalenizną 🌿</p>
                </div>
                
                <p class="text-lg mt-4">Do zobaczenia!</p>
              </div>
            </div>
            <div class="flex flex-col gap-3 min-h-72 rounded-xl px-4 items-center" v-else>
              <p class="text-center text-lg mb-2">Solarium za chwilę zostanie uruchomione...</p>
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