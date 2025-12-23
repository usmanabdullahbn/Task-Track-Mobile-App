"use client";

import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const mockWorkOrders = [
  {
    id: "17",
    type: "Corporate",
    address: "123 Main Street, Suite 200, Anytown, USA 12345",
    status: "pending",
  },
  {
    id: "18",
    type: "Industrial",
    address: "45 Industrial Drive, Building B, Industrial City, USA 67890",
    status: "pending",
  },
  {
    id: "20",
    type: "Retail",
    address: "789 Market Avenue, Store 10, Downtown, USA 54321",
    status: "pending",
  },
];

export default function PastDueTasks({ navigation }) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredOrders = mockWorkOrders.filter(
    (order) =>
      order.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderWorkOrder = ({ item }) => (
    <TouchableOpacity
      style={styles.workOrderCard}
      onPress={() =>
        navigation.navigate("WorkOrderDetail", { workOrder: item })
      }
    >
      <View style={styles.cardHeader}>
        <Text style={styles.workOrderNumber}>#{item.id}</Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      <Text style={styles.workOrderType}>{item.type}</Text>
      <View style={styles.addressContainer}>
        <Ionicons name="location-outline" size={16} color="#6b7280" />
        <Text style={styles.address}>{item.address}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
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

      <Text style={styles.sectionTitle}>Past Due Workorders</Text>

      <FlatList
        onPress={() => {
          navigation.navigate("WorkOrderDetail", { workOrderId: item.id });
        }}
        data={filteredOrders}
        renderItem={renderWorkOrder}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        scrollEnabled={true}
      />
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
});
