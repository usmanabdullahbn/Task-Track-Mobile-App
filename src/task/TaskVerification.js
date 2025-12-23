"use client"

import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from "react-native"
import { Ionicons } from "@expo/vector-icons";

export default function TaskVerification({ navigation }) {
  const handleStartTask = () => {
    navigation.navigate("TaskStart")
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.mainHeading}>Task Verification</Text>

      <View style={styles.content}>
        <View style={styles.checkmarkContainer}>
          <View style={styles.checkmarkCircle}>
            <Ionicons name="checkmark" size={48} color="#2563eb" />
          </View>
        </View>

        <Text style={styles.verificationText}>Location Verified</Text>
        <Text style={styles.descriptionText}>You are currently at the customer's site. Proceed to start the task.</Text>

        <TouchableOpacity style={styles.startButton} onPress={handleStartTask}>
          <Text style={styles.startButtonText}>Start Task</Text>
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
  startButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 24,
    width: "100%",
    marginTop: 12,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
  },
})
