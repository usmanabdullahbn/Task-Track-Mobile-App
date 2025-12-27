"use client"

import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, TextInput, SafeAreaView } from "react-native"
import { Ionicons } from "@expo/vector-icons";
import BackButton from "../components/BackButton";


export default function TaskStart({ navigation }) {
  const [comments, setComments] = useState("")
  const [photoCapture, setPhotoCapture] = useState(false)

  const handleTakePhoto = () => {
    setPhotoCapture(true)
  }

  const handleCompleteSetup = () => {
    // Navigate to next screen
    navigation.navigate("TaskCompelete")
  }

  return (
    <SafeAreaView style={styles.container}>
      <BackButton onPress={() => navigation.goBack()} />
      <Text style={styles.mainHeading}>Start Task</Text>

      <View style={styles.content}>
        {/* Capture Initial Photo Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Capture Initial Photo</Text>
          <Text style={styles.sectionDescription}>
            Ensure clear visibility of the task area and any specific requirements
          </Text>

          <View style={styles.photoPlaceholder}>
            <Ionicons name="camera" size={48} color="#d1d5db" />
            <Text style={styles.placeholderText}>No photo captured yet</Text>
          </View>

          <TouchableOpacity style={styles.takePhotoButton} onPress={handleTakePhoto}>
            <Ionicons name="camera" size={18} color="#fff" />
            <Text style={styles.takePhotoButtonText}>Take Photo</Text>
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

      {/* Complete Task Setup Button */}
      <TouchableOpacity style={styles.completeButton} onPress={handleCompleteSetup}>
        <Text style={styles.completeButtonText}>Complete Task Setup</Text>
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
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 12,
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
  placeholderText: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 8,
  },
  takePhotoButton: {
    backgroundColor: "#2563eb",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  takePhotoButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  commentsInput: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    padding: 20,
    fontSize: 14,
    color: "#1f2937",
    textAlignVertical: "top",
    minHeight: 130,
  },
  completeButton: {
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  completeButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
})
