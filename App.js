// App.js
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "./screens/HomeScreen";
import ClientesScreen from "./screens/ClientesScreen";
import AgregarClienteScreen from "./screens/AgregarClienteScreen";
import EditarClienteScreen from "./screens/EditarClienteScreen";
import ProductosScreen from "./screens/ProductosScreen";

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
          name="AgregarCliente"
          component={AgregarClienteScreen}
          options={{ headerTitle: "Agregar Cliente" }}
        />
        <Stack.Screen
          name="EditarCliente"
          component={EditarClienteScreen}
          options={{ headerTitle: "Editar Cliente" }}
        />
        <Stack.Screen
          name="Productos"
          component={ProductosScreen}
          options={{ headerTitle: "Lista de Productos" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
