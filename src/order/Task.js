"use client";

import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function TaskDetail({ route, navigation }) {
  const workOrder = route?.params?.workOrder || {
    id: "15",
    type: "Corporate",
    address: "123 Main Street, Suite 200, Anytown, USA 12345",
  };

  const tasks = [
    { id: 1, name: "Removal", status: "Pending" },
    { id: 2, name: "Installation", status: "Pending" },
  ];

  const handleTaskPress = (task) => {
    navigation.navigate("Tasks", { screen: "TaskVerification" });
  };

  const renderTaskItem = ({ item }) => (
    <TouchableOpacity
      style={styles.taskCard}
      onPress={() => handleTaskPress(item)}
    >
      <View style={styles.taskLeft}>
        <Text style={styles.taskNumber}>{item.id} #</Text>
        <Text style={styles.taskName}>{item.name}</Text>
      </View>
      <View style={styles.taskRight}>
        <View style={styles.taskStatus}>
          <Text style={styles.statusBadgeText}>{item.status}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#2563eb" />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.mainHeading}>Tasks</Text>

      <View style={styles.infoSection}>
        <Text style={styles.workOrderTitle}>
          Tasks against WorkOrder # {workOrder.id}
        </Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Customer:</Text>
          <Text style={styles.infoValue}>123:</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Project:</Text>
          <Text style={styles.infoValue}>{workOrder.address}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Asset:</Text>
          <Text style={styles.infoValue}>1 Panel</Text>
        </View>
      </View>

      <View style={styles.tasksSection}>
        <FlatList
          data={tasks}
          renderItem={renderTaskItem}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false}
        />
      </View>
    </SafeAreaView>
  );
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
  infoSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    marginBottom: 16,
  },
  workOrderTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 12,
  },
  infoRow: {
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6b7280",
    marginRight: 8,
  },
  infoValue: {
    fontSize: 12,
    fontWeight: "500",
    color: "#1f2937",
    flex: 1,
  },
  tasksSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  taskCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  taskLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  taskNumber: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1f2937",
  },
  taskName: {
    fontSize: 13,
    fontWeight: "500",
    color: "#1f2937",
  },
  taskRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  taskStatus: {
    backgroundColor: "#eff6ff",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2563eb",
  },
});
