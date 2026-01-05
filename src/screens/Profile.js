import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiClient } from "../lib/api-client";

export default function ProfileScreen({ setIsLoggedIn }) {
  const [user, setUser] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  // ✅ Load user data from AsyncStorage
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          console.log("Loaded user from storage:", parsedUser);
          console.log("User ID fields:", { id: parsedUser?.id, _id: parsedUser?._id });
          setUser(parsedUser);
        }
      } catch (error) {
        console.error("Failed to load user:", error);
      }
    };

    loadUser();
  }, []);

  // ✅ Validate password form
  const validatePasswordForm = () => {
    setPasswordError("");

    if (!passwordForm.currentPassword.trim()) {
      setPasswordError("Current password is required");
      return false;
    }

    if (!passwordForm.newPassword.trim()) {
      setPasswordError("New password is required");
      return false;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters");
      return false;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("Passwords do not match");
      return false;
    }

    if (passwordForm.currentPassword === passwordForm.newPassword) {
      setPasswordError("New password must be different from current password");
      return false;
    }

    return true;
  };

  // ✅ Handle password change
  const handleChangePassword = async () => {
    if (!validatePasswordForm()) return;

    setPasswordLoading(true);
    try {
      const userId = user?._id || user?.id;
      console.log("User object:", user);
      console.log("Attempting to change password for user ID:", userId);

      if (!userId) {
        throw new Error("User ID not found. Please logout and login again.");
      }

      const result = await apiClient.changeUserPassword(userId, {
        oldPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      console.log("Password changed successfully:", result);
      setPasswordLoading(false);
      setShowPasswordModal(false);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });

      Alert.alert("Success", "Password changed successfully!", [
        {
          text: "OK",
          onPress: () => { },
        },
      ]);
    } catch (error) {
      console.error("Password change error:", error);
      console.error("Error message:", error.message);
      console.error("Full error object:", JSON.stringify(error, null, 2));
      setPasswordLoading(false);
      setPasswordError(
        error.message || "Failed to change password. Please try again."
      );
    }
  };

  // ✅ Reset password form
  const resetPasswordForm = () => {
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setPasswordError("");
    setShowPasswords({ current: false, new: false, confirm: false });
  };

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
                <Ionicons name={item.icon} size={20} color="#00A73E" />
                <Text style={styles.itemLabel}>{item.label}</Text>
              </View>
              <Text style={styles.itemValue}>{item.value}</Text>
            </View>
          ))}
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => {
              resetPasswordForm();
              setShowPasswordModal(true);
            }}
          >
            <Ionicons name="key-outline" size={20} color="#6b7280" />
            <Text style={styles.settingLabel}>Change Password</Text>
            <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
          </TouchableOpacity>
          {/* <TouchableOpacity style={styles.settingItem}>
            <Ionicons name="settings-outline" size={20} color="#6b7280" />
            <Text style={styles.settingLabel}>Settings</Text>
            <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
          </TouchableOpacity> */}
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

      {/* ✅ Password Change Modal */}
      <Modal
        visible={showPasswordModal}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setShowPasswordModal(false);
          resetPasswordForm();
        }}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={() => {
                  setShowPasswordModal(false);
                  resetPasswordForm();
                }}
              >
                <Ionicons name="close" size={24} color="#1f2937" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Change Password</Text>
              <View style={{ width: 24 }} />
            </View>

            {/* Error Message */}
            {passwordError ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={18} color="#ef4444" />
                <Text style={styles.errorText}>{passwordError}</Text>
              </View>
            ) : null}

            {/* Password Form */}
            <ScrollView
              style={styles.formContainer}
              showsVerticalScrollIndicator={false}
            >
              {/* Current Password */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Current Password</Text>
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Enter your current password"
                    placeholderTextColor="#9ca3af"
                    secureTextEntry={!showPasswords.current}
                    value={passwordForm.currentPassword}
                    onChangeText={(text) =>
                      setPasswordForm({ ...passwordForm, currentPassword: text })
                    }
                    editable={!passwordLoading}
                  />
                  <TouchableOpacity
                    onPress={() =>
                      setShowPasswords({
                        ...showPasswords,
                        current: !showPasswords.current,
                      })
                    }
                  >
                    <Ionicons
                      name={showPasswords.current ? "eye" : "eye-off"}
                      size={20}
                      color="#6b7280"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* New Password */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>New Password</Text>
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Enter your new password"
                    placeholderTextColor="#9ca3af"
                    secureTextEntry={!showPasswords.new}
                    value={passwordForm.newPassword}
                    onChangeText={(text) =>
                      setPasswordForm({ ...passwordForm, newPassword: text })
                    }
                    editable={!passwordLoading}
                  />
                  <TouchableOpacity
                    onPress={() =>
                      setShowPasswords({
                        ...showPasswords,
                        new: !showPasswords.new,
                      })
                    }
                  >
                    <Ionicons
                      name={showPasswords.new ? "eye" : "eye-off"}
                      size={20}
                      color="#6b7280"
                    />
                  </TouchableOpacity>
                </View>
                <Text style={styles.hint}>
                  Must be at least 6 characters long
                </Text>
              </View>

              {/* Confirm Password */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Confirm Password</Text>
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Confirm your new password"
                    placeholderTextColor="#9ca3af"
                    secureTextEntry={!showPasswords.confirm}
                    value={passwordForm.confirmPassword}
                    onChangeText={(text) =>
                      setPasswordForm({
                        ...passwordForm,
                        confirmPassword: text,
                      })
                    }
                    editable={!passwordLoading}
                  />
                  <TouchableOpacity
                    onPress={() =>
                      setShowPasswords({
                        ...showPasswords,
                        confirm: !showPasswords.confirm,
                      })
                    }
                  >
                    <Ionicons
                      name={showPasswords.confirm ? "eye" : "eye-off"}
                      size={20}
                      color="#6b7280"
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowPasswordModal(false);
                  resetPasswordForm();
                }}
                disabled={passwordLoading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitButton, passwordLoading && styles.submitButtonDisabled]}
                onPress={handleChangePassword}
                disabled={passwordLoading}
              >
                {passwordLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.submitButtonText}>Change Password</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  content: { paddingHorizontal: 16, paddingVertical: 16, gap: 24 },
  header: { marginBottom: 8 },
  headerTitle: { fontSize: 28, fontWeight: "700", color: "#1f2937" },
  profileSection: {
    alignItems: "center",
    paddingVertical: 28,
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#00A73E",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#00A73E",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarText: { color: "#fff", fontSize: 32, fontWeight: "bold" },
  profileName: { fontSize: 20, fontWeight: "700", color: "#1f2937" },
  profileRole: { fontSize: 14, color: "#6b7280", marginTop: 6 },
  section: { gap: 8 },
  profileItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  itemLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  itemLabel: { fontSize: 13, fontWeight: "500", color: "#6b7280" },
  itemValue: { fontSize: 14, fontWeight: "600", color: "#1f2937", flex: 1, textAlign: "right" },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  settingLabel: { flex: 1, fontSize: 14, fontWeight: "500", color: "#1f2937" },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#ef4444",
    gap: 8,
    marginBottom: 20,
    backgroundColor: "#fff",
  },
  logoutButtonText: { color: "#ef4444", fontSize: 16, fontWeight: "600" },

  // ✅ Modal Styles
  modalContainer: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.5)" },
  modalContent: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: 100,
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: "column",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
    textAlign: "center",
    flex: 1,
  },
  formContainer: { flex: 1, marginVertical: 12 },
  formGroup: { marginBottom: 20 },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 8,
  },
  passwordInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    backgroundColor: "#f9fafb",
    height: 48,
    gap: 10,
  },
  passwordInput: {
    flex: 1,
    fontSize: 14,
    color: "#1f2937",
  },
  hint: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 6,
    fontStyle: "italic",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 13,
    color: "#ef4444",
    fontWeight: "500",
    flex: 1,
  },
  modalFooter: {
    flexDirection: "row",
    gap: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
  },
  submitButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#00A73E",
    justifyContent: "center",
    alignItems: "center",
  },
  submitButtonDisabled: { backgroundColor: "#d4edda", opacity: 0.7 }
  submitButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
});
