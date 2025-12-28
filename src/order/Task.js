"use client";

import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Modal,
  ScrollView,
  Dimensions,
  Alert,
  PanResponder,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BackButton from "../components/BackButton";

const { width: screenWidth } = Dimensions.get("window");

export default function TaskDetail({ route, navigation }) {
  const [workOrder, setWorkOrder] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSigned, setIsSigned] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [signatureImage, setSignatureImage] = useState(null);
  const [paths, setPaths] = useState([]);
  const [currentPath, setCurrentPath] = useState([]);

  const signaturePadRef = useRef(null);
  const canvasRef = useRef(null);
  const panResponderRef = useRef(null);

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

  const handleOpenSignatureModal = () => {
    if (isSigned) {
      Alert.alert(
        "Replace Signature",
        "Do you want to replace the existing signature?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Replace",
            onPress: () => {
              pathsRef.current = [];
              currentPathRef.current = [];
              setShowSignatureModal(true);
            },
          },
        ]
      );
    } else {
      setShowSignatureModal(true);
    }
  };

  const handleClearCanvasSignature = () => {
    setPaths([]);
    setCurrentPath([]);
  };

  useEffect(() => {
    if (showSignatureModal) {
      panResponderRef.current = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (evt) => {
          const { locationX, locationY } = evt.nativeEvent;
          setCurrentPath([{ x: locationX, y: locationY }]);
        },
        onPanResponderMove: (evt) => {
          const { locationX, locationY } = evt.nativeEvent;
          setCurrentPath((prev) => [...prev, { x: locationX, y: locationY }]);
        },
        onPanResponderRelease: () => {
          if (currentPath.length > 0) {
            setPaths((prev) => [...prev, currentPath]);
            setCurrentPath([]);
          }
        },
      });
    }
  }, [showSignatureModal, currentPath]);

  const handleSaveCanvasSignature = () => {
    if (paths.length === 0 && currentPath.length === 0) {
      Alert.alert("Empty Signature", "Please draw your signature first");
      return;
    }
    // Store the signature paths
    const signatureData = JSON.stringify(paths);
    setSignatureImage(signatureData);
    setIsSigned(true);
    setShowSignatureModal(false);
    setPaths([]);
    setCurrentPath([]);
  };

  const handleCloseSignatureModal = () => {
    setPaths([]);
    setCurrentPath([]);
    setShowSignatureModal(false);
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

          <TouchableOpacity
            style={styles.signaturePad}
            onPress={handleOpenSignatureModal}
          >
            {isSigned && signatureImage ? (
              <View style={styles.signaturePlaceholder}>
                {(() => {
                  try {
                    const parsedPaths = JSON.parse(signatureImage);
                    return (
                      <View style={styles.signatureDisplayCanvas}>
                        {parsedPaths.map((path, pathIndex) => {
                          const pathElements = [];
                          for (let i = 0; i < path.length - 1; i++) {
                            const point1 = path[i];
                            const point2 = path[i + 1];
                            const dx = point2.x - point1.x;
                            const dy = point2.y - point1.y;
                            const distance = Math.sqrt(dx * dx + dy * dy);
                            const angle = Math.atan2(dy, dx) * (180 / Math.PI);

                            pathElements.push(
                              <View
                                key={`line-${pathIndex}-${i}`}
                                style={{
                                  position: "absolute",
                                  left: point1.x,
                                  top: point1.y,
                                  width: distance,
                                  height: 2,
                                  backgroundColor: "#000000",
                                  transform: [{ rotate: `${angle}deg` }, { translateY: -1 }],
                                  transformOrigin: "0 0",
                                }}
                              />
                            );
                          }
                          return <View key={`path-${pathIndex}`}>{pathElements}</View>;
                        })}
                      </View>
                    );
                  } catch (e) {
                    return (
                      <Text style={styles.signatureText}>Signature captured</Text>
                    );
                  }
                })()}
              </View>
            ) : isSigned ? (
              <View style={styles.signaturePlaceholder}>
                <Ionicons name="checkmark-circle" size={48} color="#16a34a" />
                <Text style={styles.signatureText}>Signature captured</Text>
              </View>
            ) : (
              <View style={styles.signaturePlaceholder}>
                <Ionicons name="create-outline" size={40} color="#d1d5db" />
                <Text style={styles.signatureText}>
                  Tap to sign here to confirm task completion
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Signature Canvas Modal */}
        <Modal
          visible={showSignatureModal}
          transparent={true}
          animationType="slide"
          onRequestClose={handleCloseSignatureModal}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Draw Your Signature</Text>
              <TouchableOpacity onPress={handleCloseSignatureModal}>
                <Ionicons name="close" size={24} color="#1f2937" />
              </TouchableOpacity>
            </View>

            <View style={styles.instructionBox}>
              <Ionicons name="information-circle" size={16} color="#2563eb" />
              <Text style={styles.instructionText}>
                Sign in the box below to confirm
              </Text>
            </View>

            <View
              ref={canvasRef}
              style={styles.canvasContainer}
              {...(panResponderRef.current?.panHandlers || {})}
            >
              <View style={styles.canvas}>
                {/* Draw completed paths as black strokes */}
                {paths.map((path, pathIndex) => {
                  const pathElements = [];
                  for (let i = 0; i < path.length - 1; i++) {
                    const point1 = path[i];
                    const point2 = path[i + 1];
                    const dx = point2.x - point1.x;
                    const dy = point2.y - point1.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    const angle = Math.atan2(dy, dx) * (180 / Math.PI);

                    pathElements.push(
                      <View
                        key={`line-${pathIndex}-${i}`}
                        style={{
                          position: "absolute",
                          left: point1.x,
                          top: point1.y,
                          width: distance,
                          height: 3,
                          backgroundColor: "#000000",
                          transform: [{ rotate: `${angle}deg` }, { translateY: -1.5 }],
                          transformOrigin: "0 0",
                        }}
                      />
                    );
                  }
                  return <View key={`path-${pathIndex}`}>{pathElements}</View>;
                })}
                {/* Draw current path being drawn in real-time */}
                {currentPath.length > 1 &&
                  currentPath.map((point, pointIndex) => {
                    if (pointIndex === 0) return null;
                    const point1 = currentPath[pointIndex - 1];
                    const point2 = point;
                    const dx = point2.x - point1.x;
                    const dy = point2.y - point1.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    const angle = Math.atan2(dy, dx) * (180 / Math.PI);

                    return (
                      <View
                        key={`current-line-${pointIndex}`}
                        style={{
                          position: "absolute",
                          left: point1.x,
                          top: point1.y,
                          width: distance,
                          height: 3,
                          backgroundColor: "#000000",
                          transform: [{ rotate: `${angle}deg` }, { translateY: -1.5 }],
                          transformOrigin: "0 0",
                        }}
                      />
                    );
                  })}
              </View>
            </View>

            <View style={styles.canvasButtonRow}>
              <TouchableOpacity
                style={styles.clearCanvasButton}
                onPress={handleClearCanvasSignature}
              >
                <Text style={styles.clearCanvasButtonText}>Clear</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveCanvasButton}
                onPress={handleSaveCanvasSignature}
              >
                <Text style={styles.saveCanvasButtonText}>Save Signature</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Complete Order Button */}
        {/* <TouchableOpacity
          style={styles.completeButton}
          onPress={handleCompleteOrder}
        >
          <Text style={styles.completeButtonText}>Complete Order</Text>
        </TouchableOpacity> */}

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
    marginBottom: 0,
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
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
  },
  instructionBox: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginVertical: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#eff6ff",
    borderLeftWidth: 4,
    borderLeftColor: "#2563eb",
    borderRadius: 6,
    gap: 8,
  },
  instructionText: {
    fontSize: 13,
    color: "#1e40af",
    fontWeight: "500",
    flex: 1,
  },
  canvasContainer: {
    flex: 1,
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: "#f9fafb",
    borderWidth: 2,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    overflow: "hidden",
  },
  canvas: {
    flex: 1,
    backgroundColor: "#fff",
  },
  signatureDisplayCanvas: {
    width: "100%",
    height: 200,
    backgroundColor: "#fff",
    position: "relative",
  },
  canvasButtonRow: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  clearCanvasButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: "#fca5a5",
    borderRadius: 8,
    alignItems: "center",
  },
  clearCanvasButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#dc2626",
  },
  saveCanvasButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#2563eb",
    borderRadius: 8,
    alignItems: "center",
  },
  saveCanvasButtonText: {
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
