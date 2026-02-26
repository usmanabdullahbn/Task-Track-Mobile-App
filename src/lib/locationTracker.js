import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from './api-client';

const LOCATION_TASK_NAME = 'worker-tracking';

// Define the background task
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error('Location task error:', error);
    return;
  }

  if (data) {
    const { locations } = data;
    const location = locations[0];

    try {
      const userData = await AsyncStorage.getItem('user');
      if (!userData) {
        console.warn('No user data found for location tracking');
        return; // No user, stop
      }

      const user = JSON.parse(userData);
      const workerId = user.id || user._id;

      // FIX #7: Improved error handling for tracking endpoint
      if (!workerId) {
        console.error('Worker ID not found in user data');
        return;
      }

      // FIX #2: Add location name and timestamp to tracking
      const timestamp = new Date();
      const locationName = `${location.coords.latitude.toFixed(4)}, ${location.coords.longitude.toFixed(4)}`; // Default: coordinates
      
      const response = await apiClient.post('/tracking/location', {
        workerId: String(workerId),
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        speed: location.coords.speed || 0,
        locationName: locationName,
        timestamp: timestamp.toISOString(),
        timeFormatted: timestamp.toLocaleTimeString() // Human-readable time
      });

      console.log('Location saved successfully', response);
    } catch (error) {
      console.error('Failed to send location:', error.message);
      // Don't stop tracking on error, just log and continue
    }
  }
});

// Start location tracking
export const startLocationTracking = async () => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Location permission not granted');
    }

    const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
    if (backgroundStatus !== 'granted') {
      throw new Error('Background location permission not granted');
    }

    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
      accuracy: Location.Accuracy.High,
      timeInterval: 20000, // 20 seconds
      distanceInterval: 20, // 20 meters
      showsBackgroundLocationIndicator: true,
    });

    console.log('Location tracking started');
  } catch (error) {
    console.error('Failed to start location tracking:', error);
  }
};

// Stop location tracking
export const stopLocationTracking = async () => {
  try {
    await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
    console.log('Location tracking stopped');
  } catch (error) {
    console.error('Failed to stop location tracking:', error);
  }
};