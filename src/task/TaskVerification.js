"use client"

import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from "react-native"
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import BackButton from "../components/BackButton";

export default function TaskVerification({ navigation, route }) {
  const task = route?.params?.task;
  console.log("Task:", task);
  const taskId = task?._id;

  const [locationVerified, setLocationVerified] = useState(false);
  const [project, setProject] = useState(null);

  useEffect(() => {
    const fetchProjectAndVerifyLocation = async () => {
      if (task?.project?.id) {
        try {
          // Fetch project from storage
          const storedProjects = await AsyncStorage.getItem("projects");
          if (storedProjects) {
            const projects = JSON.parse(storedProjects);
            const foundProject = projects.find(p => p._id === task.project.id || p.id === task.project.id);
            if (foundProject) {
              console.log("Fetched Project from storage:", foundProject);
              setProject(foundProject);

              // Now verify location
              const { status } = await Location.requestForegroundPermissionsAsync();
              if (status !== 'granted') {
                console.log('Location permission denied');
                return;
              }

              const location = await Location.getCurrentPositionAsync({});
              const { latitude: userLat, longitude: userLng } = location.coords;
              const projectLat = parseFloat(foundProject.latitude.$numberDecimal || foundProject.latitude);
              const projectLng = parseFloat(foundProject.longitude.$numberDecimal || foundProject.longitude);

              // Calculate distance using haversine formula
              const distance = getDistanceFromLatLonInKm(userLat, userLng, projectLat, projectLng) * 1000; // in meters
              console.log(`Distance to project: ${distance} meters`);

              // Verify if within 100 meters
              if (distance <= 100) {
                setLocationVerified(true);
              } else {
                setLocationVerified(false);
              }
            } else {
              console.log("Project not found in storage");
            }
          } else {
            console.log("No projects in storage");
          }
        } catch (error) {
          console.error("Error:", error);
        }
      }
    };
    fetchProjectAndVerifyLocation();
  }, [task]);

  // Haversine formula to calculate distance
  const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
  };

  const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
  };

  const handleStartTask = () => {
    console.log("Navigating to TaskStart with taskId:", taskId);
    navigation.navigate("TaskStart", { taskId });
  };


  return (
    <SafeAreaView style={styles.container}>
      <BackButton onPress={() => navigation.goBack()} />
      <Text style={styles.mainHeading}>Task Verification</Text>

      <View style={styles.content}>
        <View style={styles.checkmarkContainer}>
          <View style={styles.checkmarkCircle}>
            <Ionicons name="checkmark" size={48} color="#2563eb" />
          </View>
        </View>

        <Text style={styles.verificationText}>
          {locationVerified ? "Location Verified" : "Location Not Verified"}
        </Text>
        <Text style={styles.descriptionText}>
          {locationVerified
            ? "You are currently at the customer's site. Proceed to start the task."
            : "You must be at the project location to proceed."
          }
        </Text>

        {task && (
          <View style={styles.taskInfo}>
            <Text style={styles.taskTitle}>{task.title || task.name}</Text>
            <Text style={styles.taskAsset}>Asset: {task.asset?.name || "N/A"}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.startButton, !locationVerified && styles.disabledButton]}
          onPress={handleStartTask}
          disabled={!locationVerified}
        >
          <Text style={[styles.startButtonText, !locationVerified && styles.disabledText]}>
            {locationVerified ? "Start Task" : "Location Required"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  mainHeading: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1f2937",
    textAlign: "center",
    marginVertical: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
    gap: 24,
  },
  checkmarkContainer: {
    alignItems: "center",
  },
  checkmarkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#eff6ff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#2563eb",
  },
  verificationText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    textAlign: "center",
  },
  descriptionText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 20,
  },
  taskInfo: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 8,
  },
  taskAsset: {
    fontSize: 14,
    color: "#6b7280",
  },
  startButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 24,
    width: "100%",
    marginTop: 12,
  },
  disabledButton: {
    backgroundColor: "#d1d5db",
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
  },
  disabledText: {
    color: "#9ca3af",
  },
})
