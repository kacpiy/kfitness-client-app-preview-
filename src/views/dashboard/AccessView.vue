<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
// import { QrcodeStream } from 'vue-qrcode-reader'
import { Location } from '@/interfaces/location'
import { useCardStore } from '@/stores/cardStore';
import { CardUseAction } from '@/interfaces/card';
import { useUserStore } from '@/stores/userStore';
import { useLocationStore } from '@/stores/locationStore';
import TheBottomSheet from '@/components/TheBottomSheet.vue';

// import gateIcon from '@/assets/icons/access-icons/turnstile.png';
// import doorIcon from '@/assets/icons/access-icons/door.png';
import doorOpenIcon from '@/assets/icons/access-icons/door-open.png';
import entranceIcon from '@/assets/icons/access-icons/entrance.png';
import sorryIcon from '@/assets/icons/access-icons/sorry.png';
import ProgressSpinner from 'primevue/progressspinner';
import Button from 'primevue/button';
import jsQR from 'jsqr';

const userStore = useUserStore();
const cardStore = useCardStore();
const locationStore = useLocationStore();

const user = computed(() => userStore.data)
const card = computed(() => cardStore.data)

const bottomSheet = ref<BottomSheetInstance | null>(null);
const currentLocation = ref<Location | null>(null);
const currentAction = ref<CardUseAction | undefined>(undefined);
const currentMethod = ref<string | undefined>(undefined);
const validationResultMessage = ref<string | null>(null);

const lastKnownPositionTime = ref(0);
const POSITION_UPDATE_INTERVAL = 7000;
const isProcessing = ref(false);

const hideBottomSheet = () => {
  bottomSheet.value?.close();
}

/** NOWY SKANER */

const scanning = ref<boolean>(false);
const flashlightOn = ref<boolean>(false);
const video = ref<HTMLVideoElement | null>(null);
const canvas = ref<HTMLCanvasElement | null>(null);
let stream: MediaStream | null = null;
let animationFrameId: number | null = null;

// Uruchamia skaner po kliknięciu przycisku
const startScanner = async (): Promise<void> => {
  try {
    scanning.value = true;
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' }
    });
    if (video.value) {
      video.value.srcObject = stream;
      video.value.onloadedmetadata = () => {
        scanFrame();
      };
      await video.value.play();
    }
  } catch (error) {
    console.error("Błąd przy uzyskiwaniu dostępu do kamery:", error);
    scanning.value = false;
  }
};

const scanFrame = (): void => {
  
};

const onDetect = async (data: { location: string, action: CardUseAction }) => {

  const { location, action } = data;

  if (!location || !action) {
    console.error('Kod QR nie zawiera wymaganych danych.')
    //error.value = 'Kod QR nie zawiera wymaganych informacji.'
    //isProcessing.value = false
    return;
  }

  if (!['door-entry', 'door-exit', 'gate-entry', 'gate-exit', 'exit'].includes(action)) {
    console.error('Nieznana akcja w kodzie QR:', action)
    //error.value = 'Kod QR zawiera nieznaną akcję.'
    //isProcessing.value = false
    return;
  }

  try {
    await handleCardUse('qrcode', action, location)
  } catch (err) {
    console.error('Błąd podczas obsługi karty:', err)
    //error.value = 'Wystąpił błąd podczas przetwarzania kodu QR.'
    //isProcessing.value = false
    return;
  }
}

const stopScanner = (): void => {
  scanning.value = false;
  flashlightOn.value = false;
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    stream = null;
  }
  if (video.value) {
    video.value.srcObject = null;
  }
};

const toggleFlashlight = async (): Promise<void> => {
  if (!stream) return;
  const videoTrack = stream.getVideoTracks()[0];
  if (!videoTrack) return;
  const capabilities = videoTrack.getCapabilities();
  
  if ('torch' in capabilities) {
    try {
      await videoTrack.applyConstraints({
        advanced: [{ torch: !flashlightOn.value }] as any
      });
      flashlightOn.value = !flashlightOn.value;
    } catch (error) {
      console.error('Błąd podczas przełączania latarki:', error);
    }
  } else {
    console.warn('Latarka nie jest wspierana na tym urządzeniu.');
  }
};


const position = ref<{ latitude: number; longitude: number } | null>(null)
let watchId: number | null = null

const location = ref<Location | null>(null);
const os = ref(getMobileOS())
const locationError = ref('')

function getMobileOS() {
  const userAgent = navigator.userAgent || navigator.vendor
  if (/android/i.test(userAgent)) {
    return 'Android'
  } else if (/iPad|iPhone|iPod/.test(userAgent)) {
    return 'iOS'
  }
  return 'unknown'
}

const handlePosition = (pos: GeolocationPosition) => {
  
  const now = Date.now();
  if (now - lastKnownPositionTime.value < POSITION_UPDATE_INTERVAL) {
    return; 
  }

  position.value = {
    latitude: pos.coords.latitude,
    longitude: pos.coords.longitude,
  }

  const matchedLocation = locationStore.matchGymLocationToUserLocation({
    latitude: pos.coords.latitude,
    longitude: pos.coords.longitude,
    accuracy: pos.coords.accuracy
  });

  if (matchedLocation) {
    location.value = matchedLocation;
    lastKnownPositionTime.value = now;
  } else {
    location.value = null;
  }
}

const handlePositionError = (err: GeolocationPositionError) => {
  switch (err.code) {
    case 1:
      if (os.value === 'iOS') {
        locationError.value = 'Geolokalizacja jest zablokowana.<br>Aby włączyć lokalizację, przejdź do:<br><br>Ustawienia > Aplikacje > Safari > Położenie (na samym dole) i ustaw na "Zezwalaj".<br><br>Zamknij i ponownie uruchom aplikację. Na karcie "Dostęp" zezwól na lokalizację.';
      } else if (os.value === 'Android') {
        locationError.value = 'Geolokalizacja jest zablokowana.<br>Aby włączyć lokalizację, przejdź do: Ustawienia > Aplikacje > Twoja przeglądarka > Uprawnienia i włącz lokalizację. Kroki mogą różnić się w zależności od urządzenia.';
      } else {
        locationError.value = 'Geolokalizacja jest zablokowana.<br>Włącz usługi lokalizacyjne w ustawieniach przeglądarki.';
      }
      break;
    case 2:
      locationError.value = 'Lokalizacja jest niedostępna.<br>Sprawdź ustawienia GPS lub połączenie sieciowe.';
      break;
    case 3:
      locationError.value = 'Przekroczono czas oczekiwania na uzyskanie lokalizacji.';
      break;
    default:
      locationError.value = `Nieznany błąd:<br>${err.message}`;
  }
}

const checkLocationPermission = () => {
  if ('permissions' in navigator) {
    navigator.permissions.query({ name: 'geolocation' }).then(function (result) {
      if (result.state === 'denied') {
        if (os.value === 'iOS') {
          locationError.value = 'Geolokalizacja jest zablokowana.<br>Aby włączyć lokalizację, przejdź do:<br><br>Ustawienia > Aplikacje > Safari > Położenie (na samym dole) i ustaw na "Zezwalaj".<br><br>Zamknij i ponownie uruchom aplikację. Na karcie "Dostęp" zezwól na lokalizację.'
        } else if (os.value === 'Android') {
          locationError.value = 'Geolokalizacja jest zablokowana.<br>Aby włączyć lokalizację, przejdź do: Ustawienia > Aplikacje > Twoja przeglądarka > Uprawnienia i włącz lokalizację.'
        } else {
          locationError.value = 'Geolokalizacja jest zablokowana.<br>Włącz usługi lokalizacyjne w ustawieniach przeglądarki.'
        }
      } else if (result.state === 'granted') {
        startWatchingPosition()
      } else {
        startWatchingPosition()
      }
    })
  } else {
    startWatchingPosition()
  }
}

const startWatchingPosition = async () => {
  if ('geolocation' in navigator) {
    watchId = navigator.geolocation.watchPosition(
      handlePosition,
      handlePositionError,
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    )
  } else {
    locationError.value = 'Geolokalizacja nie jest dostępna w tej przeglądarce.'
  }
}

const handleCardUse = async (method: string, action: CardUseAction, locationUuid?: string) => {
  
  console.log('Wywołano akcję:', action)
}

onMounted(async () => {
  await locationStore.fetchGymLocations();
  await cardStore.fetchCardData();
  checkLocationPermission()
})

onUnmounted(() => {
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId)
  }
  stopScanner();
})

</script>

<template>
  <div v-if="card">
    <!-- <div v-if="card?.ticket?.name === 'MULTISPORT'">
      <div class="px-4 mt-[50%]">
        <h1 class="text-xl font-bold mb-2 text-center">Opcja niedostępna z karnetem MULTISPORT</h1>
        <p class="text-center">Aktualny karnet na karcie nie zezwala na samoobsługową kontrolę wejść.</p>-->

        <!-- Jak bedzie inside to ma dostac info ze jest na silowni i moze wyjsc, a jak nie bedzie to info ze jakby był to moze wyjsc-->
         <!-- <div v-if="card.inside && card.location_id !== null" class="mt-3">
          <button 
            class="bg-primary-500 w-full text-black px-4 py-2 rounded font-medium disabled:opacity-20"  
            @click="handleCardUse('location','exit', locationStore.findByID(card.location_id)?.uuid)">
            Wyjście
          </button>
          <p class="text-xs text-center mt-2">Znajdujesz się obecnie na siłowni, możesz wyjść przez bramkę korzystając z powyższej opcji</p>
        </div>
        
      </div>
    </div> -->
    <div v-if="!!card?.ticket || user?.roles.includes('ROLE_GATES')">
      <!-- Skaner kodu QR -->
      <div class="px-4">
        <h1 class="text-xl font-bold mb-4">Zeskanuj kod QR</h1>
        <div class="flex justify-center" v-if="!scanning">
          <button @click="startScanner" class=" text-black p-4 rounded flex flex-col items-center gap-3">
            <font-awesome-icon :icon="['fas', 'qrcode']" class="text-primary-500 text-6xl border-primary-500 border-2 py-6 px-8"/>
            <span class="text-primary-500 font-medium">Kliknij, aby włączyć skaner</span>
          </button>
        </div>
        <div v-if="scanning" style="position: relative;" class="qr-scanner-container">
            <video ref="video" autoplay playsinline style="width: 100%;" class="border-2 border-primary-500"></video>

            <!-- Niewidoczny canvas służący do przechwytywania klatek -->
            <canvas ref="canvas" style="display: none;"></canvas>
            <!-- Przycisk do przełączania latarki -->
            <div class="flex justify-end">
              <button @click="toggleFlashlight" class="flashlight-button absolute bottom-0 right-0 m-2">
                {{ flashlightOn ? '🔦 Wyłącz latarkę' : '🔦 Włącz latarkę' }}
              </button>
            </div>
          </div>
      </div>
      
      <div class="px-4 my-3">
        <span class="text-with-strikethrough">lub</span>
      </div>
      
      <!-- Geolokalizacja -->
      <div class="px-4">
        <!-- <div class="text-center">
          <button class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800" type="button" data-drawer-target="drawer-bottom-example" data-drawer-show="drawer-bottom-example" data-drawer-placement="bottom" data-drawer-backdrop="false" aria-controls="drawer-bottom-example">
          Show bottom drawer
          </button>
        </div> -->
        <h1 class="text-xl font-bold mb-4">Skorzystaj z lokalizacji</h1>
        <div class="flex flex-col items-center">
          <p v-if="location === null && !!!locationError && !!position" class="text-center">
            Aktualnie nie znajdujesz się w pobliżu żadnej siłowni FORMA Fitness
          </p>
          <div class="w-full" v-if="location !== null">
            <h2 class="text-lg font-bold text-primary-500 text-center">{{ location.name }}</h2>
            <p class="text-center">{{ location.address }}, {{ location.postalCode}} {{ location.city}}</p>
            <div class="grid grid-cols-2 gap-4 mt-7" v-if="card">
              <div class="flex flex-col items-center gap-4">
                <div class="flex gap-2">
                  <font-awesome-icon :icon="['fas', 'door-open']"  size="xl"/>
                  <span class="font-medium">Drzwi</span>
                </div>
                <button class="bg-primary-500 w-full text-black px-4 py-2 rounded font-medium disabled:opacity-20" @click="handleCardUse('location', card.inside ? 'door-exit' : 'door-entry')" :disabled="card.inside">
                  Otwórz
                </button>
              </div>
              <div class="flex flex-col items-center gap-4">
                <div class="flex gap-2">
                  <font-awesome-icon :icon="['fas', 'arrows-turn-to-dots']" size="xl"/>
                  <span class="font-medium">Bramka</span>
                </div>
                <!-- <p class="font-medium">Kontrola bramki</p> -->
                 <div class="flex flex-col gap-4 w-full">
                  <button class="bg-primary-500 w-full text-black px-4 py-2 rounded font-medium disabled:opacity-20" :disabled="card.inside" @click="handleCardUse('location','gate-entry')">
                    Wejście
                  </button>
                  <font-awesome-icon :icon="['fas', 'arrow-right-arrow-left']" size="xl"/>
                  <button class="bg-primary-500 w-full text-black px-4 py-2 rounded font-medium disabled:opacity-20"  @click="handleCardUse('location','gate-exit')">
                    Wyjście
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div class="mt-3">
            <p v-if="locationError" class="text-sm text-center" v-html="locationError"></p>
            <p v-else-if="!position">Pobieranie Twojej lokalizacji...</p>
          </div>
        </div>
      </div>
    </div>
    <div v-else>
      <div class="px-4 mt-[50%]">
        <h1 class="text-xl font-bold mb-2 text-center">Twoja karta nie ma przypisanego karnetu</h1>
        <p class="text-center">Zakup karnet, aby uzyskać dostęp do usług FORMA Fitness</p>
      </div>
    </div>
    <TheBottomSheet ref="bottomSheet">
      <div v-if="isProcessing">
        <div class="flex flex-col justify-center">
          <ProgressSpinner  />
          <p class="text-center mt-3">Przetwarzanie żądania</p>
        </div>
      </div>
      <div v-else>
        <div v-if="validationResultMessage">
          <img :src="sorryIcon" alt="Error icon" class="w-24 mx-auto" />
          <h1 class="text-xl font-bold mt-3 mb-1 text-center">Wystąpił błąd</h1>
          <p class="text-center">{{ validationResultMessage }}</p>
        </div>
        <div v-else-if="currentAction === undefined">
          <img :src="sorryIcon" alt="Error icon" class="w-24 mx-auto" />
          <h1 class="text-xl font-bold my-3 text-center">Ooops, wystąpił błąd!</h1>
          <p class="text-center">Nie mogliśmy wykonać żądanej akcji, spróbuj ponownie</p>
        </div>
        <div v-else-if="currentAction === 'door-entry'">
          <img :src="doorOpenIcon" alt="Otwieranie drzwi" class="w-24 mx-auto" />
          <h1 class="text-xl font-bold my-3 text-center">Drzwi zostały otwarte</h1>
          <div v-show="card?.inside === false" class="flex flex-col items-center gap-3" >
            <p class="text-center">Czy chcesz od razu przejść przez bramkę?</p>
            <!-- <SwipeButton
              class="mx-auto"
              @swipeEnd="handleCardUse((currentMethod as string),'gate-entry',currentLocation?.uuid)"
            >
              <template #slider><font-awesome-icon :icon="['fas', 'angles-right']" /></template>
              Przejdź przez bramkę
            </SwipeButton> -->
            <img :src="entranceIcon" alt="Przejście przez bramnkę" class="w-12 mx-auto" />
            <Button
              @click="handleCardUse((currentMethod as string),'gate-entry',currentLocation?.uuid)"
              label="Przejdź przez bramkę" severity="primary" rounded class="w-[275px] h-12 bg-primary-600 border-primary-700"/>
            <Button 
              @click="hideBottomSheet()"
              label="Przechodzę później" severity="secondary" rounded class="w-[275px] h-12"/>
          </div>
        </div>
        <div v-else-if="currentAction === 'door-exit'">
          <img :src="doorOpenIcon" alt="Otwieranie drzwi" class="w-24 mx-auto" />
          <h1 class="text-xl font-bold my-3 text-center">Drzwi zostały otwarte</h1>
        </div>
        <div v-else-if="currentAction === 'gate-entry'">
          <img :src="entranceIcon" alt="Przejście przez bramnkę" class="w-24 mx-auto" />
          <h1 class="text-xl mt-3 font-bold text-center">Bramka została otwarta</h1>
          <p class="text-center mt-3 text-lg font-medium">Udanego treningu!</p>
        </div>
        <div v-else-if="currentAction === 'gate-exit'">
          <img :src="entranceIcon" alt="Przejście przez bramnkę" class="w-24 mx-auto" />
          <h1 class="text-xl mt-3 font-bold text-center">Bramka została otwarta</h1>
          <p class="text-center mt-3 text-lg font-medium">Dziękujemy za wspólny trening!</p>
        </div>
        <!-- <div v-else-if="currentAction === 'exit'">
          <div class="flex justify-center gap-1">
            <img :src="entranceIcon" alt="Przejście przez bramnkę" class="w-20" />
            <img :src="doorOpenIcon" alt="Przejście przez bramnkę" class="w-14 h-14" />
          </div>
          <h1 class="text-xl font-bold mt-3 text-center">Bramka została otwarta, a wraz z nią otworzyły się drzwi wyjściowe</h1>
          <p class="text-center mt-5">Pamiętaj, że masz <b>7 sekund</b> na otwarcie drzwi, po tym czasie zamkną się automatycznie</p>
          <p class="text-center text-lg mt-3 font-medium">Dziękujemy za wspólny trening!</p>
          <p class="text-center mt-7">Otworzyć drzwi ponownie?</p>
          <SwipeButton
              class="mx-auto mt-2"
              @swipeEnd="handleCardUse((currentMethod as string),'door-exit',currentLocation?.uuid)"
            >
              <template #slider><font-awesome-icon :icon="['fas', 'angles-right']" /></template>
              Przeciągnij
          </SwipeButton>
          
        </div> -->
      </div>
    </TheBottomSheet>
  </div>
</template>

<style scoped>
.qr-scanner-container {
  width: 80%;
  max-width: 500px;
  margin: 0 auto;
  position: relative;
}

.error {
  font-weight: bold;
  color: red;
}
.decode-result {
  font-weight: bold;
}
.text-with-strikethrough {
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-size: 14px;
  font-weight: bold;
  color: gray;
}

.text-with-strikethrough::before,
.text-with-strikethrough::after {
  content: '';
  flex: 1;
  height: 1px;
  background-color: gray;
}

.text-with-strikethrough::before {
  margin-right: 10px;
}

.text-with-strikethrough::after {
  margin-left: 10px;
}

.flashlight-button {
  background: rgba(0, 0, 0, 0.5);
  color: white;
  padding: 8px;
  cursor: pointer;
}
</style>
