"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, TextInput, SafeAreaView, Image, Modal, Alert, ActivityIndicator } from "react-native"
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import BackButton from "../components/BackButton";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiClient } from "../lib/api-client";

export default function TaskCompelete({ navigation, route }) {
  const taskId = route?.params?.taskId;
  // console.log("Task ID on Start  page", taskId)


  const [task, setTask] = useState(null);

  const [comments, setComments] = useState("")
  const [photo, setPhoto] = useState(null)
  const [showPhotoOptions, setShowPhotoOptions] = useState(false)
  const [photoError, setPhotoError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchTask = async () => {
      if (taskId) {
        try {
          const storedTasks = await AsyncStorage.getItem('tasks');
          if (storedTasks) {
            const tasks = JSON.parse(storedTasks);
            const foundTask = tasks.find(t => t._id === taskId);
            if (foundTask) {
              setTask(foundTask);
            }
          }
        } catch (error) {
          // console.error('Error fetching task:', error);
        }
      }
    };
    fetchTask();
  }, [taskId]);

  const handleRetakePhoto = () => {
    setShowPhotoOptions(true)
  }

  const pickImageFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setPhoto(result.assets[0].uri);
        setPhotoError(false);
        setShowPhotoOptions(false);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image from gallery");
    }
  };

  const takePhotoWithCamera = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setPhoto(result.assets[0].uri);
        setPhotoError(false);
        setShowPhotoOptions(false);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to capture photo");
    }
  };

  const handleFinishTask = async () => {
    // Validate photo is required
    if (!photo) {
      setPhotoError(true);
      Alert.alert("Photo Required", "Please capture a photo before completing the task");
      return;
    }

    setIsLoading(true);
    try {
      // Create FormData to send photo and comment
      const formData = new FormData();

      // Append the photo
      const photoName = photo.split('/').pop();
      const photoType = `image/${photoName.split('.').pop()}`;
      formData.append('files', {
        uri: photo,
        name: photoName,
        type: photoType,
      });

      // Append comments
      formData.append('comments', comments);
      formData.append('actual_end_time', new Date().toISOString());
      formData.append('status', 'Completed');

      // Update the task with photo and comments
      const updatedTask = await apiClient.updateTask(taskId, formData);

      // Console log the updated task object
      // console.log("Updated Task Object:", updatedTask);

      Alert.alert("Success", "Task completed successfully");

      // Navigate to home
      navigation.navigate("Home", { screen: "HomeMain" });
    } catch (error) {
      // console.error("Error completing task:", error);
      Alert.alert("Error", error.message || "Failed to complete task");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <BackButton onPress={() => navigation.goBack()} />
      <Text style={styles.mainHeading}>Complete Task</Text>

      {task && (
        <View style={styles.taskInfo}>
          <Text style={styles.taskTitle}>{task.title || task.name}</Text>
          <Text style={styles.taskAsset}>Asset: {task.asset?.name || "N/A"}</Text>
        </View>
      )}

      <View style={styles.content}>
        {/* Final Photo Capture Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Final Photo Capture</Text>
            <View style={styles.requiredBadge}>
              <Text style={styles.requiredText}>Required</Text>
            </View>
          </View>

          {photo ? (
            <View>
              <Image source={{ uri: photo }} style={styles.capturedImage} />
              <TouchableOpacity
                style={styles.changePhotoButton}
                onPress={() => setShowPhotoOptions(true)}
              >
                <Ionicons name="refresh" size={16} color="#00A73E" />
                <Text style={styles.changePhotoButtonText}>Change Photo</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.photoPlaceholder, photoError && styles.photoPlaceholderError]}
              onPress={() => setShowPhotoOptions(true)}
            >
              <Ionicons name="camera" size={48} color={photoError ? "#ef4444" : "#d1d5db"} />
              <Text style={[styles.placeholderText, photoError && styles.placeholderErrorText]}>
                {photoError ? "Photo is required" : "Tap to capture final photo"}
              </Text>
            </TouchableOpacity>
          )}

          {/* Photo Options Modal */}
          <Modal
            visible={showPhotoOptions}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowPhotoOptions(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.photoOptionsContainer}>
                <View style={styles.photoOptionsHeader}>
                  <Text style={styles.photoOptionsTitle}>Choose Photo Source</Text>
                  <TouchableOpacity onPress={() => setShowPhotoOptions(false)}>
                    <Ionicons name="close" size={24} color="#1f2937" />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.photoOptionButton}
                  onPress={takePhotoWithCamera}
                >
                  <View style={styles.photoOptionIcon}>
                    <Ionicons name="camera" size={24} color="#00A73E" />
                  </View>
                  <View style={styles.photoOptionText}>
                    <Text style={styles.photoOptionTitle}>Take Photo</Text>
                    <Text style={styles.photoOptionDescription}>
                      Capture a new photo with your camera
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.photoOptionButton}
                  onPress={pickImageFromGallery}
                >
                  <View style={styles.photoOptionIcon}>
                    <Ionicons name="image" size={24} color="#00A73E" />
                  </View>
                  <View style={styles.photoOptionText}>
                    <Text style={styles.photoOptionTitle}>Choose from Gallery</Text>
                    <Text style={styles.photoOptionDescription}>
                      Select a photo from your device
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>

        {/* Comments Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Comments</Text>
          <TextInput
            style={styles.commentsInput}
            placeholder="Input text"
            value={comments}
            onChangeText={setComments}
            multiline={true}
            numberOfLines={4}
          />
        </View>
      </View>

      {/* Finish Task Button */}
      <TouchableOpacity
        style={[styles.finishButton, isLoading && styles.finishButtonDisabled]}
        onPress={handleFinishTask}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.finishButtonText}>Finish Task</Text>
        )}
      </TouchableOpacity>
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
    paddingTop: 16,
    paddingBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  requiredBadge: {
    backgroundColor: "#fee2e2",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  requiredText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#dc2626",
  },
  photoPlaceholder: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#d1d5db",
    borderRadius: 12,
    paddingVertical: 80,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    backgroundColor: "#fafafa",
  },
  photoPlaceholderError: {
    borderColor: "#fecaca",
    backgroundColor: "#fef2f2",
  },
  placeholderText: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 8,
  },
  placeholderErrorText: {
    color: "#ef4444",
  },
  capturedImage: {
    width: "100%",
    height: 300,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: "#f3f4f6",
  },
  changePhotoButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: "#bfdbfe",
    borderRadius: 8,
    gap: 8,
    marginBottom: 12,
  },
  changePhotoButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#00A73E",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  photoOptionsContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
  },
  photoOptionsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  photoOptionsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1f2937",
  },
  photoOptionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    gap: 12,
  },
  photoOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
  },
  photoOptionText: {
    flex: 1,
  },
  photoOptionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 2,
  },
  photoOptionDescription: {
    fontSize: 12,
    color: "#6b7280",
    gap: 8,
  },
  photoOverlayText: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "500",
  },
  retakeButton: {
    backgroundColor: "#f3f4f6",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  retakeButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
  },
  taskInfo: {
    backgroundColor: "#fff",
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
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
  commentsInput: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: "#1f2937",
    textAlignVertical: "top",
    minHeight: 100,
  },
  finishButton: {
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: "#00A73E",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  finishButtonDisabled: {
    backgroundColor: "#93c5fd",
    opacity: 0.7,
  },
  finishButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
})
