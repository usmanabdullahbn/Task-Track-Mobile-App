import React, { useEffect, useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View, ActivityIndicator, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiClient } from "../lib/api-client";
import ReloadButton from "../components/ReloadButton";

export default function HomeScreen({ navigation }) {
  const [stats, setStats] = useState({
    totalTasks: 0,
    todoTasks: 0,
    inProgressTasks: 0,
    completedTasks: 0,
    onHoldTasks: 0,
  });
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTasksByUser = async () => {
    try {
      setLoading(true);
      const userJson = await AsyncStorage.getItem("user");
      const user = userJson ? JSON.parse(userJson) : null;
      const userId = user?._id;
      console.log("LocalStorage - User ", user);

      if (!userId) {
        setError("User ID not found");
        setTasks([]);
        setStats({ totalTasks: 0, todoTasks: 0, inProgressTasks: 0, completedTasks: 0, onHoldTasks: 0 });
        setLoading(false);
        await AsyncStorage.setItem("tasks", JSON.stringify([])); // store empty
        await AsyncStorage.setItem("orders", JSON.stringify([])); // store empty orders
        await AsyncStorage.setItem("assets", JSON.stringify([])); // store empty assets
        await AsyncStorage.setItem("projects", JSON.stringify([])); // store empty projects
        console.log("LocalStorage cleared - user not found");
        return;
      }
      // console.log(userId)
      const data = await apiClient.getTasksByUserId(userId);
      // console.log("getTasksByUserId response:", data);
      const tasksArray = Array.isArray(data) ? data : data?.tasks || [];

      // store tasks in AsyncStorage
      try {
        await AsyncStorage.setItem("tasks", JSON.stringify(tasksArray));
        console.log("LocalStorage - Tasks stored:", tasksArray.length, "tasks");
      } catch (e) {
        console.warn("Failed to save tasks to storage:", e);
      }

      // Initialize variables for fetched data
      let fetchedOrders = [];
      let fetchedAssets = [];
      let fetchedProjects = [];

      // Extract unique order IDs from tasks and fetch orders
      const orderIds = [...new Set(
        tasksArray
          .map(task => task.order?.id || task.order_id)
          .filter(id => id != null)
      )];

      if (orderIds.length > 0) {
        try {
          // Fetch each order by ID
          fetchedOrders = [];
          for (const orderId of orderIds) {
            try {
              const response = await apiClient.getOrderById(orderId);
              const orderData = response?.order || response;
              if (orderData) {
                fetchedOrders.push(orderData);
              }
            } catch (orderErr) {
              console.error("Error fetching order with ID", orderId, ":", orderErr);
            }
          }

          // Store orders in AsyncStorage
          try {
            await AsyncStorage.setItem("orders", JSON.stringify(fetchedOrders));
            console.log("LocalStorage - Orders stored:", fetchedOrders.length, "orders");
          } catch (e) {
            console.warn("Failed to save orders to storage:", e);
          }
        } catch (err) {
          console.error("Error fetching orders:", err);
        }
      }

      // Extract unique asset IDs from tasks and fetch assets
      const assetIds = [...new Set(
        tasksArray
          .map(task => task.asset?.id || task.asset_id)
          .filter(id => id != null)
      )];

      if (assetIds.length > 0) {
        try {
          // Fetch each asset by ID
          fetchedAssets = [];
          for (const assetId of assetIds) {
            try {
              const response = await apiClient.getAssetById(assetId);
              const assetData = response?.asset || response;
              if (assetData) {
                fetchedAssets.push(assetData);
              }
            } catch (assetErr) {
              console.error("Error fetching asset with ID", assetId, ":", assetErr);
            }
          }

          // Store assets in AsyncStorage
          try {
            await AsyncStorage.setItem("assets", JSON.stringify(fetchedAssets));
            console.log("LocalStorage - Assets stored:", fetchedAssets.length, "assets");
          } catch (e) {
            console.warn("Failed to save assets to storage:", e);
          }
        } catch (err) {
          console.error("Error fetching assets:", err);
        }
      }

      // Extract unique project IDs from tasks and fetch projects
      const projectIds = [...new Set(
        tasksArray
          .map(task => task.project?.id || task.project_id)
          .filter(id => id != null)
      )];

      if (projectIds.length > 0) {
        try {
          // Fetch each project by ID
          fetchedProjects = [];
          for (const projectId of projectIds) {
            try {
              const response = await apiClient.getProjectById(projectId);
              const projectData = response?.project || response;
              if (projectData) {
                fetchedProjects.push(projectData);
              }
            } catch (projectErr) {
              console.error("Error fetching project with ID", projectId, ":", projectErr);
            }
          }

          // Store projects in AsyncStorage
          try {
            await AsyncStorage.setItem("projects", JSON.stringify(fetchedProjects));
            console.log("LocalStorage - Projects stored:", fetchedProjects.length, "projects");
          } catch (e) {
            console.warn("Failed to save projects to storage:", e);
          }
        } catch (err) {
          console.error("Error fetching projects:", err);
        }
      }

      // tolerant status matching
      const norm = s => (s || "").toString().toLowerCase();
      const totalTasks = tasksArray.length;
      let todo = 0, inProgress = 0, completed = 0, onHold = 0;
      tasksArray.forEach(t => {
        const st = norm(t.status);
        if (st.includes("todo")) todo++;
        else if (st.includes("progress") || st.includes("in progress") || st.includes("in-progress")) inProgress++;
        else if (st.includes("complete") || st.includes("completed") || st.includes("done")) completed++;
        else if (st.includes("hold") || st.includes("on hold") || st.includes("on-hold")) onHold++;
      });

      setStats({
        totalTasks,
        todoTasks: todo,
        inProgressTasks: inProgress,
        completedTasks: completed,
        onHoldTasks: onHold,
      });
      setTasks(tasksArray);
      setError(null);

      // Log summary of all localStorage data
      console.log("=== LocalStorage Summary ===");
      console.log("User:", user ? { _id: user._id, name: user.name, email: user.email } : null);
      console.log("Tasks:", tasksArray);
      console.log("Orders:", fetchedOrders);
      console.log("Assets:", fetchedAssets);
      console.log("Projects:", fetchedProjects);
      console.log("===========================");
    } catch (err) {
      console.error("Failed to fetch tasks by user:", err);
      // clear stored tasks and orders on error
      try {
        await AsyncStorage.setItem("tasks", JSON.stringify([]));
        await AsyncStorage.setItem("orders", JSON.stringify([]));
        await AsyncStorage.setItem("assets", JSON.stringify([]));
        await AsyncStorage.setItem("projects", JSON.stringify([]));
        console.log("LocalStorage cleared due to error");
      } catch (e) {
        /* ignore */
      }
      setError(err?.message || "Failed to fetch tasks");
      setTasks([]);
      setStats({ totalTasks: 0, todoTasks: 0, inProgressTasks: 0, completedTasks: 0, onHoldTasks: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasksByUser();
  }, []);

  const handleReload = async () => {
    try {
      // Clear data localStorage (but keep user logged in)
      await AsyncStorage.multiRemove(["tasks", "orders", "assets", "projects"]);
      console.log("LocalStorage data cleared for refresh - user session preserved");

      // Then re-fetch all data
      await fetchTasksByUser();
    } catch (error) {
      console.error("Error during refresh:", error);
      // Still try to fetch data even if clearing failed
      await fetchTasksByUser();
    }
  };

  const statCards = [
    { label: "Total Tasks", value: stats.totalTasks ?? 0, icon: "cart", color: "#2563eb" },
    { label: "Todo Tasks", value: stats.todoTasks ?? 0, icon: "time", color: "#f59e0b" },
    { label: "Tasks In Progress", value: stats.inProgressTasks ?? 0, icon: "play", color: "#8b5cf6" },
    { label: "Tasks Completed", value: stats.completedTasks ?? 0, icon: "checkmark", color: "#10b981" },
    { label: "Tasks On Hold", value: stats.onHoldTasks ?? 0, icon: "pause", color: "#ef4444" },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerTitle}>Dashboard</Text>
              <Text style={styles.headerSubtitle}>Welcome back!</Text>
            </View>
            <ReloadButton onPress={handleReload} />
          </View>
        </View>

        {loading ? (
          <View style={{ paddingVertical: 24, alignItems: "center" }}>
            <ActivityIndicator size="large" color="#2563eb" />
          </View>
        ) : (
          <View style={styles.statsGrid}>
            {statCards.map((stat, index) => (
              <TouchableOpacity key={index} style={styles.statCard} onPress={() => navigation.navigate('PendingTasks', { status: stat.label })}>
                <View style={[styles.statIcon, { backgroundColor: stat.color + "20" }]}>
                  <Ionicons name={stat.icon} size={24} color={stat.color} />
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Tasks</Text>

          {error ? (
            <View style={styles.activityItem}>
              <View style={styles.activityDot} />
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>{error}</Text>
              </View>
            </View>
          ) : tasks.length === 0 ? (
            <View style={styles.activityItem}>
              <View style={styles.activityDot} />
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>No tasks found</Text>
              </View>
            </View>
          ) : (
            tasks.slice(0, 12).map((task, i) => (
              <View key={task._id ?? i} style={styles.activityItem}>
                <View style={[
                  styles.activityDot,
                  {
                    backgroundColor:
                      (task.status || "").toLowerCase().includes("complete") ? "#10b981" :
                        (task.status || "").toLowerCase().includes("todo") ? "#f59e0b" :
                          (task.status || "").toLowerCase().includes("hold") ? "#ef4444" :
                            "#8b5cf6"
                  }
                ]} />
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>{task.title || task.name || `Task #${task._id ?? i}`}</Text>
                  <Text style={styles.activityTime}>{task.status || "Unknown"}</Text>
                </View>
              </View>
            ))
          )}
        </View> */}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 24,
  },
  header: {
    marginBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: "48%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
  },
  statLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    gap: 12,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#2563eb",
    marginTop: 6,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1f2937",
  },
  activityTime: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 2,
  },
});
