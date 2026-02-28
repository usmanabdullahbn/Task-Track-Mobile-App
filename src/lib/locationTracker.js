import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiClient } from "./api-client";

const LOCATION_TASK_NAME = "worker-tracking";

// Define the background task
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error("Location task error:", error);
    return;
  }

  if (data) {
    const { locations } = data;
    const location = locations[0];

    try {
      const userData = await AsyncStorage.getItem("user");
      if (!userData) {
        console.warn("No user data found for location tracking");
        return; // No user, stop
      }

      const user = JSON.parse(userData);
      const workerId = user.id || user._id;

      // FIX #7: Improved error handling for tracking endpoint
      if (!workerId) {
        console.error("Worker ID not found in user data");
        return;
      }

      // FIX #2: Add location name and timestamp to tracking
      const timestamp = new Date();
      const locationName = `${location.coords.latitude.toFixed(4)}, ${location.coords.longitude.toFixed(4)}`; // Default: coordinates

      // send local date so backend can group sessions correctly
      // use device local time (en-CA format) rather than UTC
      const localDate = timestamp.toLocaleDateString('en-CA');
      const response = await apiClient.post("/tracking/location", {
        workerId: String(workerId),
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        speed: location.coords.speed || 0,
        locationName: locationName,
        timestamp: timestamp.toISOString(),
        date: localDate,
        // always send 24‑hour formatted time to server
        timeFormatted: timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
      });

      console.log("Location saved successfully", response);
    } catch (error) {
      console.error("Failed to send location:", error.message);
      // Don't stop tracking on error, just log and continue
    }
  }
});

// Start location tracking
export const startLocationTracking = async () => {
  try {
    // if the task is already running, nothing to do
    const already = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
    if (already) {
      console.log("Location tracking already active");
      return;
    }

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      throw new Error("Location permission not granted");
    }

    const { status: backgroundStatus } =
      await Location.requestBackgroundPermissionsAsync();
    if (backgroundStatus !== "granted") {
      throw new Error("Background location permission not granted");
    }

    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
      accuracy: Location.Accuracy.High,
      timeInterval: 30000, // 20 seconds
      distanceInterval: 20, // 20 meters
      showsBackgroundLocationIndicator: true,
      // required on Android to keep the task alive
      foregroundService: {
        notificationTitle: "Worker Tracking",
        notificationBody: "Tracking location in background",
      },
    });

    console.log("Location tracking started");
  } catch (error) {
    console.error("Failed to start location tracking:", error);
  }
};

// Stop location tracking
export const stopLocationTracking = async () => {
  try {
    // only attempt to stop if the task was actually running
    const hasStarted =
      await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
    if (!hasStarted) {
      console.log("Location tracking was not active, nothing to stop");
      return;
    }

    await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
    console.log("Location tracking stopped");
  } catch (error) {
    console.error("Failed to stop location tracking:", error);
  }
};
