import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SectionList,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialIcons";
import {
  fetchClientes,
  addClient,
  updateClient,
  deleteClient,
} from "../api/clienteService";
import FormInput from "../components/FormInput";
import globalStyles from "../styles/globalStyles";

const ClientesScreen = () => {
  const [clientes, setClientes] = useState([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [editingClient, setEditingClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const prepareClientesData = (data) => {
    const sortedClientes = [...data].sort((a, b) =>
      a.name.localeCompare(b.name, "es", { sensitivity: "base" })
    );

    const grouped = sortedClientes.reduce((acc, client) => {
      const firstLetter = client.name.charAt(0).toUpperCase();
      if (!acc[firstLetter]) {
        acc[firstLetter] = [];
      }
      acc[firstLetter].push(client);
      return acc;
    }, {});

    return Object.keys(grouped)
      .sort()
      .map((letter) => ({
        title: letter,
        data: grouped[letter],
      }));
  };

  const loadClientes = async (showError = true) => {
    try {
      const data = await fetchClientes();
      setClientes(prepareClientesData(data));
    } catch (error) {
      if (showError) {
        Alert.alert("Error", "No se pudieron cargar los clientes");
      }
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadClientes(false);
    }, [])
  );

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await loadClientes();
    setRefreshing(false);
  }, []);

  const resetForm = () => {
    setName("");
    setPhone("");
    setAddress("");
    setEditingClient(null);
  };

  const validateFields = () => {
    if (!name.trim() || !phone.trim() || !address.trim()) {
      Alert.alert(
        "Error",
        "Por favor complete todos los campos (nombre, teléfono y dirección)"
      );
      return false;
    }
    return true;
  };

  const handleAddClient = async () => {
    if (!validateFields() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await addClient(name.trim(), phone.trim(), address.trim());
      Alert.alert("Éxito", "Cliente agregado correctamente", [
        {
          text: "OK",
          onPress: () => {
            resetForm();
            loadClientes(false);
          },
        },
      ]);
    } catch (error) {
      if (error.code === "23505") {
        Alert.alert("Error", "El número de teléfono ya está registrado.");
      } else {
        Alert.alert("Error", "No se pudo agregar el cliente");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateClient = async () => {
    if (!editingClient || !validateFields() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await updateClient(
        editingClient.id,
        name.trim(),
        phone.trim(),
        address.trim()
      );
      Alert.alert("Éxito", "Cliente actualizado correctamente", [
        {
          text: "OK",
          onPress: () => {
            resetForm();
            loadClientes(false);
          },
        },
      ]);
    } catch (error) {
      Alert.alert("Error", "No se pudo actualizar el cliente");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClient = async (id) => {
    if (isSubmitting) return;

    Alert.alert(
      "Confirmar eliminación",
      "¿Está seguro que desea eliminar este cliente?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            setIsSubmitting(true);
            try {
              await deleteClient(id);
              Alert.alert("Éxito", "Cliente eliminado correctamente", [
                {
                  text: "OK",
                  onPress: () => loadClientes(false),
                },
              ]);
            } catch (error) {
              Alert.alert("Error", "No se pudo eliminar el cliente");
            } finally {
              setIsSubmitting(false);
            }
          },
        },
      ]
    );
  };

  const renderSectionHeader = ({ section: { title } }) => (
    <View style={globalStyles.sectionHeader}>
      <Text style={globalStyles.sectionHeaderText}>{title}</Text>
    </View>
  );

  const renderItem = ({ item }) => (
    <View style={globalStyles.itemCard}>
      <View style={globalStyles.itemHeader}>
        <View style={globalStyles.iconContainer}>
          <Icon name="person" size={24} color="#666" />
        </View>
        <View style={globalStyles.itemInfo}>
          <Text style={globalStyles.itemName}>{item.name}</Text>
          <View style={globalStyles.infoRow}>
            <Icon name="phone" size={16} color="#666" />
            <Text style={globalStyles.infoText}>{item.phone}</Text>
          </View>
          <View style={globalStyles.infoRow}>
            <Icon name="place" size={16} color="#666" />
            <Text style={globalStyles.infoText}>{item.address}</Text>
          </View>
        </View>
        <View style={globalStyles.actionButtons}>
          <TouchableOpacity
            style={[globalStyles.actionButton, globalStyles.editButton]}
            onPress={() => {
              setName(item.name);
              setPhone(item.phone || "");
              setAddress(item.address || "");
              setEditingClient(item);
            }}
            disabled={isSubmitting}
          >
            <Icon name="edit" size={20} color="#0066CC" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[globalStyles.actionButton, globalStyles.deleteButton]}
            onPress={() => handleDeleteClient(item.id)}
            disabled={isSubmitting}
          >
            <Icon name="delete" size={20} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={globalStyles.centered}>
        <ActivityIndicator size="large" color="#0066CC" />
      </View>
    );
  }

  return (
    <View style={globalStyles.container}>
      <View style={globalStyles.inputContainer}>
        <FormInput
          placeholder="Nombre del Cliente"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          editable={!isSubmitting}
        />
        <FormInput
          placeholder="Teléfono"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          editable={!isSubmitting}
        />
        <FormInput
          placeholder="Dirección"
          value={address}
          onChangeText={setAddress}
          multiline
          editable={!isSubmitting}
        />
        <TouchableOpacity
          style={[
            globalStyles.submitButton,
            (isSubmitting ||
              !name.trim() ||
              !phone.trim() ||
              !address.trim()) &&
              globalStyles.disabledButton,
          ]}
          onPress={editingClient ? handleUpdateClient : handleAddClient}
          disabled={
            isSubmitting || !name.trim() || !phone.trim() || !address.trim()
          }
        >
          <Text style={globalStyles.submitButtonText}>
            {editingClient ? "Actualizar Cliente" : "Agregar Cliente"}
          </Text>
        </TouchableOpacity>
        {editingClient && (
          <TouchableOpacity
            style={globalStyles.cancelButton}
            onPress={resetForm}
            disabled={isSubmitting}
          >
            <Text style={globalStyles.cancelButtonText}>Cancelar Edición</Text>
          </TouchableOpacity>
        )}
      </View>

      <SectionList
        sections={clientes}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={globalStyles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onPress={onRefresh}
            enabled={!isSubmitting}
          />
        }
        ListEmptyComponent={
          <View style={globalStyles.emptyContainer}>
            <Text style={globalStyles.emptyText}>
              No hay clientes registrados
            </Text>
          </View>
        }
        stickySectionHeadersEnabled
      />
    </View>
  );
};

export default ClientesScreen;
