import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BackButton from "../components/BackButton";

export default function ProfileScreen({ setIsLoggedIn }) {
  const [user, setUser] = useState(null);

  // ✅ Load user data from AsyncStorage
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Failed to load user:", error);
      }
    };

    loadUser();
  }, []);

  // ✅ Logout logic (clears storage)
  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem("user");
              await AsyncStorage.removeItem("token");
              setIsLoggedIn(false);
            } catch (error) {
              console.error("Error clearing user data:", error);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  // ✅ Profile info items
  const profileItems = [
    {
      icon: "person-outline",
      label: "Name",
      value: user?.name || "Loading...",
    },
    {
      icon: "mail-outline",
      label: "Email",
      value: user?.email || "Loading...",
    },
    { icon: "call-outline", label: "Phone", value: user?.phone || "Not provided" },
    { icon: "briefcase-outline", label: "Role", value: user?.role || "Not specified" },
    { icon: "checkmark-circle-outline", label: "Status", value: user?.status || "Not specified" },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <BackButton onPress={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        {/* Profile Info */}
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name ? user.name.charAt(0).toUpperCase() : "?"}
            </Text>
          </View>
          <Text style={styles.profileName}>
            {user?.name || "Loading..."}
          </Text>
          <Text style={styles.profileRole}>{user?.designation || "User"}</Text>
        </View>

        {/* Info Items */}
        <View style={styles.section}>
          {profileItems.map((item, index) => (
            <View key={index} style={styles.profileItem}>
              <View style={styles.itemLeft}>
                <Ionicons name={item.icon} size={20} color="#2563eb" />
                <Text style={styles.itemLabel}>{item.label}</Text>
              </View>
              <Text style={styles.itemValue}>{item.value}</Text>
            </View>
          ))}
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.settingItem}>
            <Ionicons name="settings-outline" size={20} color="#6b7280" />
            <Text style={styles.settingLabel}>Settings</Text>
            <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingItem}>
            <Ionicons name="help-circle-outline" size={20} color="#6b7280" />
            <Text style={styles.settingLabel}>Help & Support</Text>
            <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
          </TouchableOpacity>
        </View>

        {/* ✅ Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  content: { paddingHorizontal: 16, paddingVertical: 16, gap: 24 },
  header: { marginBottom: 8 },
  headerTitle: { fontSize: 24, fontWeight: "bold", color: "#1f2937" },
  profileSection: {
    alignItems: "center",
    paddingVertical: 24,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#2563eb",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarText: { color: "#fff", fontSize: 28, fontWeight: "bold" },
  profileName: { fontSize: 18, fontWeight: "bold", color: "#1f2937" },
  profileRole: { fontSize: 14, color: "#6b7280", marginTop: 4 },
  section: { gap: 8 },
  profileItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  itemLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  itemLabel: { fontSize: 14, fontWeight: "500", color: "#6b7280" },
  itemValue: { fontSize: 14, fontWeight: "600", color: "#1f2937" },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    gap: 12,
  },
  settingLabel: { flex: 1, fontSize: 14, fontWeight: "500", color: "#1f2937" },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ef4444",
    gap: 8,
    marginBottom: 20,
  },
  logoutButtonText: { color: "#ef4444", fontSize: 16, fontWeight: "600" },
});
