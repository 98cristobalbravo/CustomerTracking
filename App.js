// App.js
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "./screens/HomeScreen";
import ClientesScreen from "./screens/ClientesScreen";
import ProductosScreen from "./screens/ProductosScreen";
import PedidosScreen from "./screens/PedidosScreen";

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Inicio">
        <Stack.Screen
          name="Inicio"
          component={HomeScreen}
          options={{ headerTitle: "Bienvenido" }}
        />
        <Stack.Screen
          name="Clientes"
          component={ClientesScreen}
          options={{ headerTitle: "Lista de Clientes" }}
        />
        <Stack.Screen
          name="Productos"
          component={ProductosScreen}
          options={{ headerTitle: "Lista de Productos" }}
        />
        <Stack.Screen
          name="Pedidos"
          component={PedidosScreen}
          options={{ headerTitle: "Pedidos del Día" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
