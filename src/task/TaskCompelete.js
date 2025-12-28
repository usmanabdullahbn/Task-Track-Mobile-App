"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, TextInput, SafeAreaView, Image } from "react-native"
import { Ionicons } from "@expo/vector-icons";
import BackButton from "../components/BackButton";
import AsyncStorage from "@react-native-async-storage/async-storage";
import img from "../asserts/worker.webp"

export default function TaskCompelete({ navigation, route }) {
  const taskId = route?.params?.taskId;
    console.log("Task ID on Start  page",taskId)


  const [task, setTask] = useState(null);

  const [comments, setComments] = useState("")
  const [photoRetaken, setPhotoRetaken] = useState(false)

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
          console.error('Error fetching task:', error);
        }
      }
    };
    fetchTask();
  }, [taskId]);

  const handleRetakePhoto = () => {
    setPhotoRetaken(!photoRetaken)
  }

  const handleFinishTask = () => {
    // Navigate to completion screen or home
    navigation.navigate("Home", { screen: "HomeMain" })
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
          <Text style={styles.sectionTitle}>Final Photo Capture</Text>

          <View style={styles.photoContainer}>
            <Image source={img} style={styles.photoImage} />
            <View style={styles.photoOverlay}>
              <Ionicons name="camera" size={32} color="#fff" />
              <Text style={styles.photoOverlayText}>Tap to Capture Final Photo</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.retakeButton} onPress={handleRetakePhoto}>
            <Text style={styles.retakeButtonText}>Retake Photo</Text>
          </TouchableOpacity>
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
      <TouchableOpacity style={styles.finishButton} onPress={handleFinishTask}>
        <Text style={styles.finishButtonText}>Finish Task</Text>
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
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 12,
  },
  photoContainer: {
    position: "relative",
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 12,
  },
  photoImage: {
    width: "100%",
    height: 180,
    backgroundColor: "#e5e7eb",
  },
  photoOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
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
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  finishButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
})
