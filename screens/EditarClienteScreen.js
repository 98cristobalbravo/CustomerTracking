import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { supabase } from "../api/supabaseClient";
import Icon from "react-native-vector-icons/MaterialIcons";

// The EditarClienteScreen component is similar to the ClientesScreen component, but it's used to edit a single client. It receives the client object as a prop and updates it in the database when the user submits the form. It also allows the user to delete the client.

const EditarClienteScreen = ({ route, navigation }) => {
  const { cliente } = route.params;
  const [nombre, setNombre] = useState(cliente.name);
  const [direccion, setDireccion] = useState(cliente.address || "");
  const [telefono, setTelefono] = useState(cliente.phone || "");
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    // Validar que los campos obligatorios no estén vacíos
    if (!nombre.trim()) {
      Alert.alert("Error", "El nombre es obligatorio");
      return;
    }
    if (!direccion.trim()) {
      Alert.alert("Error", "La dirección es obligatoria");
      return;
    }
    if (!telefono.trim()) {
      Alert.alert("Error", "El teléfono es obligatorio");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("customers")
        .update({
          name: nombre,
          address: direccion,
          phone: telefono,
        })
        .eq("id", cliente.id);

      if (error) throw error;

      Alert.alert("Éxito", "Cliente actualizado correctamente");
      navigation.goBack();
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudo actualizar el cliente");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      "Confirmar eliminación",
      "¿Estás seguro de que deseas eliminar este cliente?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          onPress: async () => {
            setLoading(true);
            try {
              const { error } = await supabase
                .from("customers")
                .delete()
                .eq("id", cliente.id);

              if (error) throw error;

              Alert.alert("Éxito", "Cliente eliminado correctamente");
              navigation.goBack();
            } catch (error) {
              console.error(error);
              Alert.alert("Error", "No se pudo eliminar el cliente");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Icon name="person" size={24} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Nombre del cliente"
            value={nombre}
            onChangeText={setNombre}
          />
        </View>

        <View style={styles.inputContainer}>
          <Icon name="place" size={24} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Dirección"
            value={direccion}
            onChangeText={setDireccion}
          />
        </View>

        <View style={styles.inputContainer}>
          <Icon name="phone" size={24} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Teléfono"
            value={telefono}
            onChangeText={setTelefono}
            keyboardType="phone-pad"
          />
        </View>

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleUpdate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Actualizar Cliente</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.submitButton, styles.deleteButton]}
          onPress={handleDelete}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>Eliminar Cliente</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  form: {
    padding: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: "#333",
  },
  submitButton: {
    backgroundColor: "#0066CC",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 16,
  },
  deleteButton: {
    backgroundColor: "#CC0000",
    marginTop: 8,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default EditarClienteScreen;
