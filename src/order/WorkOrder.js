"use client";

import { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function WorkOrderDetail({ route, navigation }) {
  const workOrder = route?.params?.workOrder || {
    id: "15",
    type: "Corporate",
    address: "123 Main Street, Suite 200, Anytown, USA 12345",
  };

  const [isSigned, setIsSigned] = useState(false);
  const signaturePadRef = useRef(null);

  const assets = [
    { id: 1, name: "Switch", status: "Pending" },
    { id: 2, name: "Panel", status: "Pending" },
  ];

  const handleClearSignature = () => {
    setIsSigned(false);
  };

  const handleSaveSignature = () => {
    setIsSigned(true);
  };

  const handleCompleteWorkorder = () => {
    alert("Workorder completed!");
    navigation.navigate("Home", {screen: "HomeMain"})
  };

  const renderAssetItem = ({ item }) => (
    <TouchableOpacity
      style={styles.assetCard}
      // onPress={() =>
      //   navigation.navigate("Tasks", { screen: "TaskDetail" }, { item })
      // }
    >
      <View style={styles.assetLeft}>
        <Text style={styles.assetNumber}>{item.id} #</Text>
        <Text style={styles.assetName}>{item.name}</Text>
      </View>
      <View style={styles.assetRight}>
        <View style={styles.assetStatus}>
          <Text style={styles.statusBadgeText}>{item.status}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#2563eb" />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerSection}>
          <Text style={styles.mainHeading}>Assets against Work Order</Text>
        </View>

        <View style={styles.workOrderInfo}>
          <Text style={styles.workOrderTitle}>
            Asset against WorkOrder # {workOrder.id}
          </Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Customer:</Text>
            <Text style={styles.infoValue}>123:</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Project:</Text>
            <Text style={styles.infoValue}>{workOrder.address}</Text>
          </View>
        </View>

        {/* Assets List */}
        <View style={styles.assetsSection}>
          <FlatList
            data={assets}
            renderItem={renderAssetItem}
            keyExtractor={(item) => item.id.toString()}
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

        {/* Complete Workorder Button */}
        <TouchableOpacity
          style={styles.completeButton}
          onPress={handleCompleteWorkorder}
        >
          <Text style={styles.completeButtonText}>Complete Workorder</Text>
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
  headerSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    backgroundColor: "#fff",
  },
  mainHeading: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1f2937",
    textAlign: "center",
  },
  workOrderInfo: {
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
    marginBottom: 16,
  },
  infoRow: {
    marginBottom: 12,
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
    fontSize: 13,
    fontWeight: "500",
    color: "#1f2937",
    flex: 1,
  },
  assetsSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  assetCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  assetLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  assetNumber: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1f2937",
  },
  assetName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1f2937",
  },
  assetRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  assetStatus: {
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
