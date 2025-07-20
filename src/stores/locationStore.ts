import { defineStore } from 'pinia';
import { Location } from '@/interfaces/location';
import apiClient from '@/axios';
import { isPointWithinRadius } from 'geolib';

interface LocationState {
  gymLocations: Location[] | null;
}

export const useLocationStore = defineStore('location', {
  state: (): LocationState => ({
    gymLocations: null,
  }),
  actions: {
    async fetchGymLocations() {
      try {
        const response = await apiClient.get('/locations');
        this.gymLocations = response.data;
      } catch (error) {
        console.error('Error fetching gym locations:', error);
      }
    },
    
    matchGymLocationToUserLocation(userLocation: { latitude: number; longitude: number, accuracy: number }): Location | null {
      if (!this.gymLocations) {
        return null;
      }
      
      const userLat = userLocation.latitude;
      const userLng = userLocation.longitude;
      
      let maxDistance = 10;

      if (userLocation.accuracy && userLocation.accuracy > 10) {
        maxDistance = Math.min(userLocation.accuracy+maxDistance, 100);
      }

      const gymLocation = this.gymLocations.find((location) =>
        isPointWithinRadius(
          { latitude: userLat, longitude: userLng },
          { latitude: location.latitude, longitude: location.longitude },
          maxDistance
        )
      );

      //return this.gymLocations.find((location) => location.city === 'Głubczyce') as Location;

      return gymLocation || null;
    },
    findByUUID(uuid: string): Location | null {
      return this.gymLocations?.find((location) => location.uuid === uuid) || null;
    },
    findByID(id: number): Location | null {
      return this.gymLocations?.find((location) => location.id === id) || null;
    },
    deg2rad(deg: number) {
      return deg * (Math.PI / 180);
    }
  },
});