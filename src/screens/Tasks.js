import React from "react";
import { View, Text, StyleSheet } from "react-native";

const Tasks = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Tasks</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, // takes full screen
    justifyContent: "center", // centers vertically
    alignItems: "center", // centers horizontally
    backgroundColor: "#f9fafb", // optional light background
  },
  text: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
  },
});

export default Tasks;
