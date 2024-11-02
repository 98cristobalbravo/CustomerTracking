import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { supabase } from "../api/supabaseClient";

const ClientesScreen = () => {
  const [clientes, setClientes] = useState([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [editingClient, setEditingClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch clients from Supabase
  const fetchClientes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      setClientes(data || []);
    } catch (error) {
      Alert.alert("Error", "No se pudieron cargar los clientes");
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchClientes();
    }, [])
  );

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchClientes();
  }, []);

  // Add a new client
  const addClient = async () => {
    if (!name) {
      Alert.alert("Error", "Por favor ingrese al menos el nombre del cliente");
      return;
    }

    try {
      const { error } = await supabase
        .from("customers")
        .insert([{ name, phone, address }]);

      if (error) throw error;
      resetForm();
      Alert.alert("Éxito", "Cliente agregado correctamente");
      fetchClientes();
    } catch (error) {
      Alert.alert("Error", "No se pudo agregar el cliente");
      console.error(error);
    }
  };

  // Update an existing client entry
  const updateClient = async () => {
    if (!editingClient || !name) {
      Alert.alert("Error", "Por favor ingrese al menos el nombre del cliente");
      return;
    }

    try {
      const { error } = await supabase
        .from("customers")
        .update({ name, phone, address })
        .eq("id", editingClient.id);

      if (error) throw error;
      resetForm();
      Alert.alert("Éxito", "Cliente actualizado correctamente");
      fetchClientes();
    } catch (error) {
      Alert.alert("Error", "No se pudo actualizar el cliente");
      console.error(error);
    }
  };

  // Delete a client
  const deleteClient = async (id) => {
    Alert.alert(
      "Confirmar eliminación",
      "¿Está seguro que desea eliminar este cliente?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              const { error } = await supabase
                .from("customers")
                .delete()
                .eq("id", id);

              if (error) throw error;
              Alert.alert("Éxito", "Cliente eliminado correctamente");
              fetchClientes();
            } catch (error) {
              Alert.alert("Error", "No se pudo eliminar el cliente");
              console.error(error);
            }
          },
        },
      ]
    );
  };

  const resetForm = () => {
    setName("");
    setPhone("");
    setAddress("");
    setEditingClient(null);
  };

  const renderItem = ({ item }) => (
    <View style={styles.clientItem}>
      <View style={styles.clientHeader}>
        <View style={styles.iconContainer}>
          <Icon name="person" size={24} color="#666" />
        </View>
        <View style={styles.clientInfo}>
          <Text style={styles.clientName}>{item.name}</Text>
          {item.phone && (
            <View style={styles.infoRow}>
              <Icon name="phone" size={16} color="#666" />
              <Text style={styles.infoText}>{item.phone}</Text>
            </View>
          )}
          {item.address && (
            <View style={styles.infoRow}>
              <Icon name="place" size={16} color="#666" />
              <Text style={styles.infoText}>{item.address}</Text>
            </View>
          )}
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => {
              setName(item.name);
              setPhone(item.phone || "");
              setAddress(item.address || "");
              setEditingClient(item);
            }}
          >
            <Icon name="edit" size={20} color="#0066CC" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => deleteClient(item.id)}
          >
            <Icon name="delete" size={20} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0066CC" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Nombre del Cliente"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />
        <TextInput
          placeholder="Teléfono"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          style={styles.input}
        />
        <TextInput
          placeholder="Dirección"
          value={address}
          onChangeText={setAddress}
          style={styles.input}
        />
        <TouchableOpacity
          style={styles.submitButton}
          onPress={editingClient ? updateClient : addClient}
        >
          <Text style={styles.submitButtonText}>
            {editingClient ? "Actualizar Cliente" : "Agregar Cliente"}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={clientes}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay clientes registrados</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  inputContainer: {
    backgroundColor: "#fff",
    padding: 16,
    margin: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  input: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: "#0066CC",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  list: {
    padding: 16,
  },
  clientItem: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  clientHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  infoText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 4,
  },
  actionButtons: {
    flexDirection: "row",
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    marginLeft: 4,
  },
  editButton: {
    backgroundColor: "#E3F2FD",
  },
  deleteButton: {
    backgroundColor: "#FFEBEE",
  },
  emptyContainer: {
    padding: 16,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
  },
});

export default ClientesScreen;
