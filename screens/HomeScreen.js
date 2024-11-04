// HomeScreen.js
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import CustomButton from "../styles/CustomButton";
import buttonStyles from "../styles/buttons";

const HomeScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={buttonStyles.title}>Bienvenido</Text>
      <View style={buttonStyles.buttonContainer}>
        <CustomButton
          title="Clientes"
          iconName="people"
          onPress={() => navigation.navigate("Clientes")}
          style={buttonStyles.buttonSpacing}
        />
        <CustomButton
          title="Pedidos"
          iconName="list"
          onPress={() => navigation.navigate("Pedidos")} // Cambia "Orders" por "Pedidos"
          style={buttonStyles.buttonSpacing}
        />
        <CustomButton
          title="Productos"
          iconName="cube"
          onPress={() => navigation.navigate("Productos")}
          style={buttonStyles.buttonSpacing}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default HomeScreen;
