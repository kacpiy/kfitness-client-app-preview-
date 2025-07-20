<script setup lang="ts">
import { onMounted, ref } from 'vue';
import apiClient from '../../axios';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale'; 
import { UserStats, UserStatsDailyTrainingTime } from '../../interfaces/user';
import { useUserStore } from '../../stores/userStore';
import Chart from 'primevue/chart';

const userStore = useUserStore();

interface ICounInsideByLocation {
	location_id: number;
	count: number;
}

const countInsideByLocation = ref<ICounInsideByLocation[]>([]);
const userStats = ref<UserStats | null>(null);
const userStatsDailyTrainingTime = ref<UserStatsDailyTrainingTime | null>(null);
const chartContainer = ref<HTMLDivElement | null>(null);

const fetchCountInsideByLocation = async () => {
	try {
		const response = await apiClient.get('/locations/count-inside-by-location');
		countInsideByLocation.value = response.data;
	} catch (error: any) {
		console.error('Błąd podczas pobierania danych lokalizacji:', error);
	}
}

const fetchUserStats = () => {
	try {
		const userStatsPromise = apiClient.get<UserStats>('/users/me/stats');
		const dailyTrainingTimePromise = apiClient.get<UserStatsDailyTrainingTime>('/users/me/stats/daily-training-time');

		userStatsPromise.then((response) => {
			userStats.value = response.data;
		}).catch((error) => {
			console.error('Błąd podczas pobierania statystyk użytkownika:', error);
		});

		dailyTrainingTimePromise.then((response) => {
			userStatsDailyTrainingTime.value = response.data;
			chartData.value = setChartData();
  		chartOptions.value = setChartOptions();
			scrollToEnd();
		}).catch((error) => {
			console.error('Błąd podczas pobierania statystyk codziennych treningów:', error);
		});
		
	} catch (error: any) {
		console.error('Błąd podczas pobierania danych:', error);
	}
};

const scrollToEnd = () => {
  if (chartContainer.value) {
    const container = chartContainer.value;
    container.scrollLeft = container.scrollWidth - container.clientWidth;
  }
};


const loadData = () => {
	fetchCountInsideByLocation();
	fetchUserStats();
}

onMounted(() => {
	loadData();
});

const chartData = ref();
const chartOptions = ref();
        
const setChartData = () => {
	
};

const setChartOptions = () => {
   
}

</script>

<template>
	<div>
		<PullToRefresh @refresh="loadData()">
			<div class="px-4">
				<div class="relative w-full h-32 overflow-hidden rounded-xl">
					<!-- Lewa strona -->
					<div class="absolute inset-0 bg-cover bg-center opacity-75" 
							style="background-image: url('/images/locations/1.jpg'); 
											clip-path: polygon(0 0, calc(100% - 8vw) 0, 0 100%);">
					</div>
					<div class="absolute inset-0 flex flex-col justify-start items-start p-3">
						<h2 class="text-white text-xl font-bold" style="text-shadow: black 2px 2px;">Głubczyce</h2>
						<p class="text-primary-500 text-5xl font-bold motion-preset-focus" style="text-shadow: black 2px 2px;" 
							v-show="!!countInsideByLocation.find(l => l.location_id === 1)">{{ countInsideByLocation.find(l => l.location_id === 1)?.count ?? 0}}</p>
					</div>

					<!-- Prawa strona -->
					<div class="absolute inset-0 right-0 bg-cover bg-center opacity-75" 
							style="background-image: url('/images/locations/2.jpg'); 
											clip-path: polygon(100% 0, 100% 100%, 8vw 100%);">
					</div>
					<div class="absolute inset-0 flex flex-col justify-end items-end p-3">
						<p class="text-primary-500 text-5xl font-bold motion-preset-focus" style="text-shadow: black 2px 2px;" 
							v-show="!!countInsideByLocation.find(l => l.location_id === 2)">{{ countInsideByLocation.find(l => l.location_id === 2)?.count ?? 0}}</p>
						<h2 class="text-white text-xl font-bold" style="text-shadow: black 2px 2px;">Głogówek</h2>
					</div>
				</div>
			</div>
			<div class="px-4 mt-3 grid grid-cols-2 gap-3 overflow-hidden h-full">
				<div class="p-3 bg-neutral-900 rounded-xl text-center flex flex-col gap-1 motion-delay-[100ms] motion-opacity-in-0">
					<font-awesome-icon :icon="['fas', 'user-graduate']" class="text-primary-500" size="xl"/>
					<p class="text-sm">Jesteś z nami od</p>
					<p class="font-medium">{{ userStore.registerDate ? format(new Date(userStore.registerDate), 'dd MMM yyyy', { locale: pl }) + 'r.' : '-' }}</p>
				</div>
				
				<div class="p-3 bg-neutral-900 rounded-xl text-center flex flex-col gap-1 motion-delay-[150ms] motion-opacity-in-0">
					<font-awesome-icon :icon="['fas', 'door-open']" class="text-primary-500" size="xl"/>
					<p class="text-sm">Liczba treningów</p>
					<p class="font-medium">{{ userStats?.visitCount || '-' }}</p>
				</div>
				
				<div class="p-3 bg-neutral-900 rounded-xl text-center flex flex-col gap-2 motion-delay-[200ms] motion-opacity-in-0">
					<font-awesome-icon :icon="['fas', 'dumbbell']" class="text-primary-500" size="xl"/>
					<p class="text-sm">Ostatni raz na siłowni byłeś/aś</p> 
					<p class="font-medium">{{ userStats?.lastVisit ? format(new Date(userStats.lastVisit), 'dd MMM yyyy', { locale: pl }) + 'r.' : '-' }}</p>
					<p class="text-sm">a twój trening trwał</p>
					<p class="font-medium">{{ userStats?.lastDuration ? `${Math.floor(userStats.lastDuration / 3600)}h ${Math.floor((userStats.lastDuration % 3600) / 60)}min` : '-' }}</p>
				</div>

				<div class="p-3 bg-neutral-900 rounded-xl text-center flex flex-col gap-2 motion-delay-[250ms] motion-opacity-in-0">
					<font-awesome-icon :icon="['fas', 'heart-pulse']" class="text-primary-500" size="xl"/>
					<p class="text-sm">Łączny czas Twoich treningów wynosi</p>
					<p class="font-medium">{{ userStats ? `${Math.floor(userStats.totalTrainingTime / 3600)}h ${Math.floor((userStats.totalTrainingTime % 3600) / 60)}min` : '-' }}</p>
					<p class="text-sm">a najdłuższy trwał</p>
					<p class="font-medium">{{ userStats ? `${Math.floor(userStats.longestTraining / 3600)}h ${Math.floor((userStats.longestTraining % 3600) / 60)}min` : '-' }}</p>
				</div>
			</div>
		</PullToRefresh>
		<div class="px-4 mt-3 rounded-xl">
			<div class="bg-neutral-900 p-4 rounded-xl" >
				<div class="text-sm text-center mb-1">Czas treningu [godz.]</div>
				<div class="overflow-auto" ref="chartContainer">
					<Chart type="line" :data="chartData" :options="chartOptions" class="h-[10rem] min-w-[750px]" />	
				</div>
			</div>
		</div>
	</div>
</template>

