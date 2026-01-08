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
    ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiClient } from "../lib/api-client";
import BackButton from "../components/BackButton";

// Helper function to get status badge colors
const getStatusColor = (status) => {
    const statusLower = (status || "").toLowerCase();
    if (statusLower.includes("pending")) {
        return { bg: "#fef3c7", color: "#d97706" };
    } else if (statusLower.includes("progress") || statusLower.includes("in progress")) {
        return { bg: "#dcfce7", color: "#00A73E" };
    } else if (statusLower.includes("complete") || statusLower.includes("completed")) {
        return { bg: "#dcfce7", color: "#00A73E" };
    } else if (statusLower.includes("hold") || statusLower.includes("on-hold")) {
        return { bg: "#fee2e2", color: "#dc2626" };
    }
    return { bg: "#f3f4f6", color: "#6b7280" };
};

export default function AllTasks({ navigation, route }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedFilter, setSelectedFilter] = useState("All");
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [loggedInUserId, setLoggedInUserId] = useState(null);

    const statusOptions = ["All", "Pending", "In Progress", "Completed", "On Hold"];

    // Apply filter from route params on mount
    useEffect(() => {
        if (route?.params?.status) {
            const statusParam = route.params.status;
            // Capitalize first letter of each word
            const formattedStatus = statusParam
                .split(" ")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(" ");
            setSelectedFilter(formattedStatus);
        }
    }, [route?.params?.status]);

    // Fetch logged in user and tasks from local storage
    useEffect(() => {
        const fetchTasksFromStorage = async () => {
            try {
                setLoading(true);

                // Get logged in user info
                const userData = await AsyncStorage.getItem("user");
                let userId = null;
                if (userData) {
                    const user = JSON.parse(userData);
                    userId = user._id || user.id;
                    setLoggedInUserId(userId);
                    console.log("Logged in user ID:", userId);
                }

                // Get tasks from local storage
                const storedTasks = await AsyncStorage.getItem("tasks");
                console.log("Stored tasks data:", storedTasks);

                if (!storedTasks) {
                    setError("No tasks found in local storage");
                    setLoading(false);
                    return;
                }

                const allTasks = JSON.parse(storedTasks);
                console.log("Parsed tasks:", allTasks);
                console.log("Total tasks in storage:", allTasks.length);

                if (!Array.isArray(allTasks) || allTasks.length === 0) {
                    setError("No tasks available");
                    setLoading(false);
                    return;
                }

                // Use all tasks since they should already be filtered for the logged-in user
                // from the Home screen's fetchTasksByUser call
                setTasks(allTasks);
                setError(null);
            } catch (err) {
                console.error("Error fetching tasks from storage:", err);
                setError(err.message || "Failed to load tasks");
                setTasks([]);
            } finally {
                setLoading(false);
            }
        };

        fetchTasksFromStorage();
    }, []);

    const filteredTasks = tasks.filter((task) => {
        const matchesSearch =
            (task.description || task.title || "")
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            (task.customer || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            (task.project || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            (task.title || "").toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus =
            selectedFilter === "All" ||
            (task.status || "").toLowerCase().includes(selectedFilter.toLowerCase());
        return matchesSearch && matchesStatus;
    });

    const renderTaskCard = ({ item }) => (
        <TouchableOpacity
            style={styles.taskCard}
            onPress={() =>
                navigation.navigate("TaskDetail", { taskId: item._id || item.id })
            }
        >
            <View style={styles.cardHeader}>
                <Text style={styles.taskTitle}>{item.title}</Text>
                <View
                    style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusColor(item.status || item.completed).bg },
                    ]}
                >
                    <Text
                        style={[
                            styles.statusText,
                            {
                                color: getStatusColor(item.status || item.completed).color,
                            },
                        ]}
                    >
                        {item.status ||
                            (item.completed === "Yes" || item.completed === true
                                ? "Completed"
                                : "Pending")}
                    </Text>
                </View>
            </View>

            <Text style={styles.projectInfo}>
                {item.project || "No Project"} • Order: {item.order || "N/A"}
            </Text>

            <View style={styles.detailsContainer}>
                <View style={styles.detailItem}>
                    <Ionicons name="person-outline" size={14} color="#6b7280" />
                    <Text style={styles.detailText}>{item.customer || "N/A"}</Text>
                </View>
                <View style={styles.detailItem}>
                    <Ionicons name="time-outline" size={14} color="#6b7280" />
                    <Text style={styles.detailText}>
                        Duration: {item.duration || "N/A"} hrs
                    </Text>
                </View>
            </View>

            {item.asset && (
                <View style={styles.assetContainer}>
                    <Ionicons name="cube-outline" size={14} color="#6b7280" />
                    <Text style={styles.assetText}>{item.asset}</Text>
                </View>
            )}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <BackButton onPress={() => navigation.goBack()} />
            <Text style={styles.mainHeading}>All Tasks</Text>

            {/* Filter Section */}
            <View style={styles.filterSection}>
                <Text style={styles.filterTitle}>Filter by Status</Text>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.filterScroll}
                >
                    {statusOptions.map((status) => (
                        <TouchableOpacity
                            key={status}
                            style={[
                                styles.filterButton,
                                selectedFilter === status && styles.filterButtonActive,
                            ]}
                            onPress={() => setSelectedFilter(status)}
                        >
                            <Text
                                style={[
                                    styles.filterButtonText,
                                    selectedFilter === status && styles.filterButtonTextActive,
                                ]}
                            >
                                {status}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <View style={styles.searchContainer}>
                <Ionicons name="search-outline" size={20} color="#6b7280" />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search tasks, customer, project..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            <Text style={styles.sectionTitle}>
                {filteredTasks.length} Tasks
            </Text>

            {loading ? (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color="#00A73E" />
                    <Text style={styles.loaderText}>Loading tasks...</Text>
                </View>
            ) : error ? (
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle-outline" size={40} color="#ef4444" />
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            ) : filteredTasks && filteredTasks.length > 0 ? (
                <View style={{ flex: 1 }}>
                    <FlatList
                        data={filteredTasks}
                        renderItem={renderTaskCard}
                        keyExtractor={(item, index) => (item._id || item.id || index).toString()}
                        contentContainerStyle={styles.listContent}
                        scrollEnabled={true}
                    />
                </View>
            ) : (
                <View style={styles.emptyContainer}>
                    <Ionicons name="checkmark-done-outline" size={40} color="#d1d5db" />
                    <Text style={styles.emptyText}>
                        {searchQuery ? "No tasks match your search" : "No tasks found"}
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
    filterSection: {
        paddingHorizontal: 16,
        marginVertical: 12,
        backgroundColor: "#fff",
        borderRadius: 12,
        paddingVertical: 12,
        marginHorizontal: 16,
    },
    filterTitle: {
        fontSize: 13,
        fontWeight: "700",
        color: "#1f2937",
        marginBottom: 10,
    },
    filterScroll: {
        flexDirection: "row",
    },
    filterButton: {
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: "#e5e7eb",
        marginRight: 10,
        backgroundColor: "#f9fafb",
        justifyContent: "center",
        alignItems: "center",
    },
    filterButtonActive: {
        backgroundColor: "#00A73E",
        borderColor: "#00A73E",
    },
    filterButtonText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#6b7280",
    },
    filterButtonTextActive: {
        color: "#fff",
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 20,
        gap: 12,
    },
    taskCard: {
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
    taskTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#1f2937",
        flex: 1,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
    },
    statusText: {
        fontSize: 12,
        fontWeight: "600",
    },
    projectInfo: {
        fontSize: 13,
        fontWeight: "600",
        color: "#00A73E",
        marginBottom: 10,
    },
    detailsContainer: {
        gap: 8,
        marginBottom: 8,
    },
    detailItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    detailText: {
        fontSize: 12,
        color: "#6b7280",
    },
    assetContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: "#f3f4f6",
    },
    assetText: {
        fontSize: 12,
        color: "#6b7280",
        fontWeight: "500",
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
