"use client";

import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiClient } from "../lib/api-client";
import BackButton from "../components/BackButton";


export default function PendingTasks({ navigation }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch orders from local storage
  useEffect(() => {
    const fetchOrdersFromStorage = async () => {
      try {
        setLoading(true);

        // Get orders from local storage
        const storedOrders = await AsyncStorage.getItem("orders");
        console.log("Stored orders data:", storedOrders);

        if (!storedOrders) {
          setError("No orders found in local storage");
          setLoading(false);
          return;
        }

        const orders = JSON.parse(storedOrders);
        console.log("Parsed orders:", orders);

        if (!Array.isArray(orders) || orders.length === 0) {
          setError("No orders available");
          setLoading(false);
          return;
        }

        setOrders(orders);
        setError(null);
      } catch (err) {
        console.error("Error fetching orders from storage:", err);
        setError(err.message || "Failed to load orders");
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrdersFromStorage();
  }, []);

  const filteredOrders = orders.filter(
    (order) =>
      (order.description || order.address || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.title || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderWorkOrder = ({ item }) => (
    <TouchableOpacity
      style={styles.workOrderCard}
      onPress={() =>
        navigation.navigate("TaskDetail", { orderId: item._id || item.id })
      }
    >
      <View style={styles.cardHeader}>
        {/* <Text style={styles.workOrderNumber}>#{item._id ? item._id.substring(0, 8) : item.id}</Text> */}
        <Text style={styles.workOrderNumber}>{item.title}</Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      <Text style={styles.workOrderType}>{item.order_number}</Text>
      <View style={styles.addressContainer}>
        {/* <Ionicons name="location-outline" size={16} color="#6b7280" /> */}
        <Text style={styles.address}>{item.customer.name}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <BackButton onPress={() => navigation.goBack()} />
      <Text style={styles.mainHeading}>Work Orders</Text>

      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#6b7280" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search customers..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <Text style={styles.sectionTitle}>All Workorders</Text>

      {/* Debug Info */}
      <View style={{ paddingHorizontal: 16, marginVertical: 8 }}>
        <Text style={{ fontSize: 12, color: "#6b7280" }}>
          Orders: {orders.length} | Filtered: {filteredOrders.length} | Loading: {loading ? 'Yes' : 'No'} | Error: {error ? 'Yes' : 'No'}
        </Text>
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loaderText}>Loading orders...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={40} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : filteredOrders && filteredOrders.length > 0 ? (
        <View style={{ flex: 1 }}>
          <FlatList
            data={filteredOrders}
            renderItem={renderWorkOrder}
            keyExtractor={(item, index) => (item._id || item.id || index).toString()}
            contentContainerStyle={styles.listContent}
            scrollEnabled={true}
          />
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="briefcase-outline" size={40} color="#d1d5db" />
          <Text style={styles.emptyText}>
            {searchQuery ? "No orders match your search" : "No orders found"}
          </Text>
        </View>
      )}
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#1f2937",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginHorizontal: 16,
    marginVertical: 12,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 12,
  },
  workOrderCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  workOrderNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
  },
  statusBadge: {
    backgroundColor: "#fef3c7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#92400e",
  },
  workOrderType: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2563eb",
    marginBottom: 8,
  },
  addressContainer: {
    flexDirection: "row",
    gap: 8,
  },
  address: {
    flex: 1,
    fontSize: 12,
    color: "#6b7280",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loaderText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6b7280",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  errorText: {
    marginTop: 12,
    fontSize: 14,
    color: "#ef4444",
    textAlign: "center",
    paddingHorizontal: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
});
