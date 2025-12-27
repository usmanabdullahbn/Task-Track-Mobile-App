"use client";

import { useState, useEffect,  useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BackButton from "../components/BackButton";

export default function TaskDetail({ route, navigation }) {
  const [workOrder, setWorkOrder] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSigned, setIsSigned] = useState(false);
  const signaturePadRef = useRef(null);

  const orderId = route?.params?.orderId;

  useEffect(() => {
    if (!orderId) {
      setError("No order ID provided");
      setLoading(false);
      return;
    }

    const fetchOrderAndTasks = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch orders from local storage
        const storedOrders = await AsyncStorage.getItem("orders");
        if (!storedOrders) {
          setError("No orders found in local storage");
          setLoading(false);
          return;
        }

        const orders = JSON.parse(storedOrders);
        const workOrder = orders.find(
          (order) => (order._id || order.id) === orderId
        );
        if (!workOrder) {
          setError("Order not found");
          setLoading(false);
          return;
        }
        setWorkOrder(workOrder);

        // Fetch tasks from local storage
        const storedTasks = await AsyncStorage.getItem("tasks");
        if (!storedTasks) {
          setTasks([]);
          setLoading(false);
          return;
        }

        const allTasks = JSON.parse(storedTasks);
        // Filter tasks by order id
        const orderTasks = allTasks.filter(
          (task) => task.order?.id === orderId
        );
        console.log("Filtered tasks:", orderTasks);
        setTasks(orderTasks);
      } catch (err) {
        console.error("Error fetching order and tasks:", err);
        setError(err.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderAndTasks();
  }, [orderId]);

  console.log("WorkOrder:", workOrder);
  console.log("Tasks for Order ID", orderId, ":", tasks);

  const handleTaskPress = (task) => {
    navigation.navigate("Tasks", { screen: "TaskVerification" });
  };

  const handleClearSignature = () => {
    setIsSigned(false);
  };

  const handleSaveSignature = () => {
    setIsSigned(true);
  };

  const handleCompleteOrder = () => {
    alert("Order completed!");
    navigation.navigate("Home", { screen: "HomeMain" });
  };

  const renderTaskItem = ({ item }) => (
    <TouchableOpacity
      style={styles.taskCard}
      onPress={() => handleTaskPress(item)}
    >
      <View style={styles.taskLeft}>
        <View style={styles.taskHeader}>
          <Text style={styles.taskNumber}>{item.id}</Text>
          <Text style={styles.taskName}>{item.title || item.name}</Text>
        </View>
        <Text style={styles.taskAsset}>
          Asset: {item.asset?.name || "No asset"}
        </Text>
      </View>
      <View style={styles.taskRight}>
        <View style={styles.taskStatus}>
          <Text style={styles.statusBadgeText}>{item.status}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#2563eb" />
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading tasks...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <BackButton onPress={() => navigation.goBack()} />
        <Text style={styles.mainHeading}>Tasks</Text>

      <View style={styles.infoSection}>
        <Text style={styles.workOrderTitle}>
          Tasks against WorkOrder #{" "}
          {workOrder?.order_number ||
            workOrder?.id ||
            workOrder?._id ||
            orderId}
        </Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Customer:</Text>
          <Text style={styles.infoValue}>
            {workOrder?.customer?.name || "N/A"}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Project:</Text>
          <Text style={styles.infoValue}>
            {workOrder?.title || workOrder?.description || "N/A"}
          </Text>
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
          keyExtractor={(item) => item._id || item.id.toString()}
          scrollEnabled={false}
        />
      </View>

      {/* Signature Section */}
      <View style={styles.signatureSection}>
        <Text style={styles.signatureTitle}>Customer Signature</Text>

        <View style={styles.signaturePad}>
          <View style={styles.signaturePlaceholder}>
            <Ionicons name="create-outline" size={40} color="#d1d5db" />
            <Text style={styles.signatureText}>
              Tap to sign here to confirm task completion
            </Text>
          </View>
        </View>

        <View style={styles.signatureButtonRow}>
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClearSignature}
          >
            <Text style={styles.clearButtonText}>Clear Signature</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSaveSignature}
          >
            <Text style={styles.saveButtonText}>Save Signature</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Complete Order Button */}
      <TouchableOpacity
        style={styles.completeButton}
        onPress={handleCompleteOrder}
      >
        <Text style={styles.completeButtonText}>Complete Order</Text>
      </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",

  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#6b7280",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#ef4444",
    textAlign: "center",
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
    flexDirection: "column",
    gap: 4,
  },
  taskHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
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
  taskAsset: {
    fontSize: 12,
    fontWeight: "400",
    color: "#6b7280",
    marginTop: 2,
    marginLeft: 14, // Align with task name
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
  signatureSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  signatureTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 16,
  },
  signaturePad: {
    marginBottom: 16,
  },
  signaturePlaceholder: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#d1d5db",
    borderStyle: "dashed",
    borderRadius: 8,
    paddingVertical: 48,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  signatureText: {
    fontSize: 13,
    color: "#6b7280",
    textAlign: "center",
    paddingHorizontal: 12,
  },
  signatureButtonRow: {
    flexDirection: "row",
    gap: 12,
  },
  clearButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: "#86efac",
    borderRadius: 8,
    alignItems: "center",
  },
  clearButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#16a34a",
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#16a34a",
    borderRadius: 8,
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#fff",
  },
  completeButton: {
    marginHorizontal: 16,
    marginBottom: 24,
    paddingVertical: 14,
    backgroundColor: "#2563eb",
    borderRadius: 8,
    alignItems: "center",
  },
  completeButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
  },
});
