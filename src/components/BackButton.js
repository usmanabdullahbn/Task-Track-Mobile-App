import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const BackButton = ({ onPress, style }) => {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.button, style]}>
      <Ionicons name="arrow-back" size={24} color="#1f2937" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 8,
    marginLeft: 16,
    marginTop: 16,
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 10,
  },
});

export default BackButton;