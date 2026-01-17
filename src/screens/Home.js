import React, { useEffect, useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View, ActivityIndicator, TouchableOpacity, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiClient } from "../lib/api-client";
import ReloadButton from "../components/ReloadButton";

export default function HomeScreen({ navigation }) {
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    inProgressOrders: 0,
    totalTasks: 0,
    todoTasks: 0,
    inProgressTasks: 0,
    completedTasks: 0,
    onHoldTasks: 0,
  });
  const [orders, setOrders] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("orders"); // "orders" or "tasks"

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
        setOrders([]);
        setStats({ totalOrders: 0, pendingOrders: 0, inProgressOrders: 0, totalTasks: 0, todoTasks: 0, inProgressTasks: 0, completedTasks: 0, onHoldTasks: 0 });
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

      // Initialize order stats variables
      let totalOrders = 0;
      let pendingOrders = 0;
      let inProgressOrders = 0;

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

          // Calculate order stats
          totalOrders = fetchedOrders.length;
          pendingOrders = 0;
          inProgressOrders = 0;
          fetchedOrders.forEach(o => {
            const st = (o.status || "").toString().toLowerCase();
            if (st.includes("pending")) pendingOrders++;
            else if (st.includes("progress") || st.includes("in progress")) inProgressOrders++;
          });

          // Log order stats
          console.log("=== ORDER STATS ===");
          console.log("Total Orders:", totalOrders);
          console.log("Pending Orders:", pendingOrders);
          console.log("In Progress Orders:", inProgressOrders);
          console.log("==================");

          // Update stats with order data
          setStats(prevStats => ({
            ...prevStats,
            totalOrders,
            pendingOrders,
            inProgressOrders,
          }));
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
        totalOrders,
        pendingOrders,
        inProgressOrders,
        totalTasks,
        todoTasks: todo,
        inProgressTasks: inProgress,
        completedTasks: completed,
        onHoldTasks: onHold,
      });
      setTasks(tasksArray);
      setOrders(fetchedOrders);
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
      setOrders([]);
      setStats({ totalOrders: 0, pendingOrders: 0, inProgressOrders: 0, totalTasks: 0, todoTasks: 0, inProgressTasks: 0, completedTasks: 0, onHoldTasks: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      await fetchTasksByUser();
      // Load stored data after fetching is complete
      await loadStoredData();
    };
    initializeData();
  }, []);

  const loadStoredData = async () => {
    try {
      const storedOrders = await AsyncStorage.getItem("orders");
      const storedTasks = await AsyncStorage.getItem("tasks");

      if (storedOrders) {
        const ordersList = JSON.parse(storedOrders);
        setOrders(ordersList);
        console.log("Loaded stored orders:", ordersList);

        // Calculate order stats
        let totalOrders = ordersList.length;
        let pendingOrders = 0;
        let inProgressOrders = 0;

        ordersList.forEach(order => {
          const status = (order.status || "").toString().toLowerCase();
          if (status.includes("pending")) {
            pendingOrders++;
          } else if (status.includes("progress") || status.includes("in progress") || status.includes("in-progress")) {
            inProgressOrders++;
          }
        });

        // Log order stats from localStorage
        console.log("=== ORDER STATS (from localStorage) ===");
        console.log("Total Orders:", totalOrders);
        console.log("Pending Orders:", pendingOrders);
        console.log("In Progress Orders:", inProgressOrders);
        console.log("========================================");

        // Update stats with calculated order data
        setStats(prevStats => ({
          ...prevStats,
          totalOrders,
          pendingOrders,
          inProgressOrders,
        }));

        console.log("Order stats calculated:", { totalOrders, pendingOrders, inProgressOrders });
      }

      if (storedTasks) {
        const tasksList = JSON.parse(storedTasks);
        setTasks(tasksList);
        console.log("Loaded stored tasks:", tasksList);

        // Calculate task stats
        let totalTasks = tasksList.length;
        let todo = 0, inProgress = 0, completed = 0, onHold = 0;

        tasksList.forEach(task => {
          const status = (task.status || "").toString().toLowerCase();
          if (status.includes("todo")) {
            todo++;
          } else if (status.includes("progress") || status.includes("in progress") || status.includes("in-progress")) {
            inProgress++;
          } else if (status.includes("complete") || status.includes("completed") || status.includes("done")) {
            completed++;
          } else if (status.includes("hold") || status.includes("on hold") || status.includes("on-hold")) {
            onHold++;
          }
        });

        // Update stats with calculated task data
        setStats(prevStats => ({
          ...prevStats,
          totalTasks,
          todoTasks: todo,
          inProgressTasks: inProgress,
          completedTasks: completed,
          onHoldTasks: onHold,
        }));

        console.log("Task stats calculated:", { totalTasks, todo, inProgress, completed, onHold });
      }
    } catch (err) {
      console.error("Error loading stored data:", err);
    }
  };

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

  // Helper function to get status color and background
  const getStatusColor = (status) => {
    const statusLower = (status || "").toLowerCase();
    if (statusLower.includes("pending")) {
      return { bg: "#fef3c7", color: "#d97706" };
    } else if (statusLower.includes("progress") || statusLower.includes("in progress")) {
      return { bg: "#dcfce7", color: "#00A73E" };
    } else if (statusLower.includes("complete") || statusLower.includes("completed")) {
      return { bg: "#dcfce7", color: "#059669" };
    } else if (statusLower.includes("hold") || statusLower.includes("on-hold")) {
      return { bg: "#fee2e2", color: "#dc2626" };
    }
    return { bg: "#f3f4f6", color: "#6b7280" };
  };

  const statCards = [
    { label: "Total Order", value: stats.totalOrders ?? 0, icon: "cart", bg: "#6366f1", iconBg: "#4f46e5" },
    { label: "Pending Order", value: stats.pendingOrders ?? 0, icon: "time", bg: "#14b8a6", iconBg: "#0d9488" },
    { label: "In Progress", value: stats.inProgressOrders ?? 0, icon: "play", bg: "#f97316", iconBg: "#ea580c" },
  ];

  const taskStatCards = [
    { label: "Total Tasks", value: stats.totalTasks ?? 0, icon: "cart", bg: "#6366f1", iconBg: "#4f46e5" },
    { label: "Todo Tasks", value: stats.todoTasks ?? 0, icon: "time", bg: "#14b8a6", iconBg: "#0d9488" },
    { label: "Tasks In Progress", value: stats.inProgressTasks ?? 0, icon: "play", bg: "#f97316", iconBg: "#ea580c" },
    { label: "Tasks Completed", value: stats.completedTasks ?? 0, icon: "checkmark", bg: "#10b981", iconBg: "#059669" },
    { label: "Tasks On Hold", value: stats.onHoldTasks ?? 0, icon: "pause", bg: "#ef4444", iconBg: "#dc2626" },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerTitle}>DASHBOARD</Text>
              <Text style={styles.headerSubtitle}>Welcome Back!</Text>
            </View>
            <Pressable
              style={({ pressed }) => [
                styles.reloadButton,
                pressed && { opacity: 0.7 }
              ]}
              onPress={handleReload}
            >
              <Ionicons name="refresh" size={22} color="#1f2937" />
            </Pressable>
          </View>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <Pressable
            onPress={() => setActiveTab("orders")}
            style={[
              styles.tab,
              activeTab === "orders" && styles.tabActive
            ]}
          >
            <Text style={[
              styles.tabText,
              activeTab === "orders" && styles.tabTextActive
            ]}>
              ORDERS
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab("tasks")}
            style={[
              styles.tab,
              activeTab === "tasks" && styles.tabActive
            ]}
          >
            <Text style={[
              styles.tabText,
              activeTab === "tasks" && styles.tabTextActive
            ]}>
              TASKS
            </Text>
          </Pressable>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#008236" />
          </View>
        ) : (
          <>
            {/* Stats Section */}
            <View style={styles.statsContainer}>
              {activeTab === "orders" ? (
                <View style={[styles.statsGrid]}>
                  {statCards.map((stat, index) => {
                    let filterStatus = null;
                    if (stat.label.includes("Pending")) {
                      filterStatus = "pending";
                    } else if (stat.label.includes("In Progress")) {
                      filterStatus = "in progress";
                    }
                    return (
                      <TouchableOpacity key={index} style={[styles.statCard, { backgroundColor: stat.bg }]} onPress={() => navigation.navigate('PendingTasks', filterStatus ? { status: filterStatus } : {})}>
                        <View style={[styles.statIcon, { backgroundColor: stat.iconBg }]}>
                          <Ionicons name={stat.icon} size={28} color="#fff" />
                        </View>
                        <Text style={styles.statValue}>{stat.value}</Text>
                        <Text style={styles.statLabel}>{stat.label}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ) : (
                <View>
                  <View style={[styles.statsGrid, { marginBottom: 12 }]}>
                    {taskStatCards.slice(0, 3).map((stat, index) => {
                      let filterStatus = null;
                      if (stat.label.includes("Total")) {
                        filterStatus = "All";
                      } else if (stat.label.includes("Todo")) {
                        filterStatus = "Todo";
                      } else if (stat.label.includes("In Progress")) {
                        filterStatus = "In Progress";
                      }
                      return (
                        <TouchableOpacity
                          key={index}
                          style={[styles.statCard, { backgroundColor: stat.bg }]}
                          onPress={() => navigation.navigate('AllTasks', { status: filterStatus })}
                        >
                          <View style={[styles.statIcon, { backgroundColor: stat.iconBg }]}>
                            <Ionicons name={stat.icon} size={28} color="#fff" />
                          </View>
                          <Text style={styles.statValue}>{stat.value}</Text>
                          <Text style={styles.statLabel}>{stat.label}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                  <View style={styles.statsGrid}>
                    {taskStatCards.slice(3).map((stat, index) => {
                      let filterStatus = null;
                      if (stat.label.includes("Completed")) {
                        filterStatus = "Completed";
                      } else if (stat.label.includes("On Hold")) {
                        filterStatus = "On Hold";
                      }
                      return (
                        <TouchableOpacity
                          key={index + 3}
                          style={[styles.statCard, { backgroundColor: stat.bg }]}
                          onPress={() => navigation.navigate('AllTasks', { status: filterStatus })}
                        >
                          <View style={[styles.statIcon, { backgroundColor: stat.iconBg }]}>
                            <Ionicons name={stat.icon} size={28} color="#fff" />
                          </View>
                          <Text style={styles.statValue}>{stat.value}</Text>
                          <Text style={styles.statLabel}>{stat.label}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}
            </View>

            {/* Recent Items Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent {activeTab === "orders" ? "Orders" : "Tasks"}</Text>
                <TouchableOpacity onPress={() => navigation.navigate(activeTab === "orders" ? "PendingTasks" : "AllTasks")}>
                  <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
              </View>

              {error ? (
                <View style={styles.errorItem}>
                  <Ionicons name="alert-circle" size={20} color="#ef4444" />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : (activeTab === "orders" ? orders : tasks).length === 0 ? (
                <View style={styles.emptyItem}>
                  <Ionicons name="inbox-outline" size={24} color="#9ca3af" />
                  <Text style={styles.emptyText}>No {activeTab === "orders" ? "orders" : "tasks"} found</Text>
                </View>
              ) : (
                (activeTab === "orders" ? orders : tasks).map((item, i) => (
                  <TouchableOpacity
                    key={item._id ?? i}
                    style={styles.recentItem}
                    onPress={() => {
                      if (activeTab === "orders") {
                        navigation.navigate("TaskDetail", { orderId: item._id || item.id });
                      } else {
                        navigation.navigate("Tasks", { screen: "TaskVerification", params: { taskId: item._id, task: item } });
                      }
                    }}
                  >
                    <View style={styles.recentItemContent}>
                      <Text style={styles.recentItemTitle} numberOfLines={1}>{item.title || item.name || `Item #${item._id ?? i}`}</Text>
                      {activeTab === "orders" ? (
                        <Text style={styles.recentItemMeta} numberOfLines={1}>Order #{item.order_number || item._id?.slice(-6) || "N/A"}</Text>
                      ) : (
                        <Text style={styles.recentItemMeta} numberOfLines={1}>{item.description || item.location || "No description"}</Text>
                      )}
                    </View>
                    <View style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(item.status).bg }
                    ]}>
                      <Text style={[
                        styles.statusText,
                        { color: getStatusColor(item.status).color }
                      ]}>
                        {item.status || "Unknown"}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  content: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    gap: 28,
  },

  // Header Styles
  header: {
    marginBottom: 12,
    marginTop: 8,
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
    fontSize: 32,
    fontWeight: "800",
    color: "#0f172a",
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 15,
    color: "#64748b",
    fontWeight: "400",
  },
  reloadButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },

  // Tab Navigation Styles
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#e8eaed",
    borderRadius: 14,
    padding: 5,
    gap: 6,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  tabActive: {
    backgroundColor: "#00A73E",
    shadowColor: "#00A73E",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#71717a",
    letterSpacing: 0.2,
  },
  tabTextActive: {
    color: "#ffffff",
  },

  // Loading & Empty States
  loadingContainer: {
    paddingVertical: 48,
    alignItems: "center",
    justifyContent: "center",
  },

  // Stats Container Styles
  statsContainer: {
    paddingHorizontal: 0,
    paddingVertical: 8,
    gap: 12,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    minHeight: 160,
  },
  statIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  statValue: {
    fontSize: 32,
    fontWeight: "900",
    color: "#ffffff",
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.95)",
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 18,
  },

  // Section Styles
  section: {
    gap: 14,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#008236",
  },

  // Error & Empty States
  errorItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: "#fee2e2",
    borderRadius: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  errorText: {
    fontSize: 14,
    color: "#b91c1c",
    fontWeight: "600",
  },
  emptyItem: {
    flexDirection: "column",
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: "#f9fafb",
    borderRadius: 16,
    gap: 10,
  },
  emptyText: {
    fontSize: 15,
    color: "#6b7280",
    fontWeight: "500",
  },

  // Recent Items Styles
  recentItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 2,
  },
  recentItemContent: {
    flex: 1,
  },
  recentItemTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 4,
  },
  recentItemStatus: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "600",
    marginTop: 4,
  },
  recentItemMeta: {
    fontSize: 13,
    color: "#78909c",
    fontWeight: "400",
  },
  statusBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
