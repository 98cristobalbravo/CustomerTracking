import React from "react";
import { Pressable, Text, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

const CustomButton = ({ onPress, title, iconName, style, textStyle }) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        pressed ? styles.buttonPressed : styles.buttonDefault,
        style,
      ]}
    >
      {({ pressed }) => (
        <>
          {iconName && (
            <Icon name={iconName} size={20} color="white" style={styles.icon} />
          )}
          <Text
            style={[
              styles.text,
              pressed ? styles.textPressed : styles.textDefault,
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    width: "100%",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  icon: {
    marginRight: 8,
  },
  buttonDefault: {
    backgroundColor: "#007AFF",
  },
  buttonPressed: {
    backgroundColor: "#005ECE",
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
  },
  textDefault: {
    color: "white",
  },
  textPressed: {
    color: "#E0E0E0",
  },
});

export default CustomButton;
