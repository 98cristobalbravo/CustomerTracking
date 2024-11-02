import React, { useState, useEffect } from "react";
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
import Icon from "react-native-vector-icons/MaterialIcons";
import { supabase } from "../api/supabaseClient";

const ProductosScreen = () => {
  const [products, setProducts] = useState([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      Alert.alert("Error", "No se pudieron cargar los productos");
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchProducts();
  }, []);

  const addProduct = async () => {
    if (!name || !price) {
      Alert.alert("Error", "Por favor complete todos los campos");
      return;
    }
    try {
      const { error } = await supabase
        .from("products")
        .insert([{ name, price: parseFloat(price) }]);
      if (error) throw error;

      setName("");
      setPrice("");
      Alert.alert("Éxito", "Producto agregado correctamente");
      fetchProducts();
    } catch (error) {
      Alert.alert("Error", "No se pudo agregar el producto");
      console.error(error);
    }
  };

  const updateProduct = async () => {
    if (!editingProduct || !name || !price) {
      Alert.alert("Error", "Por favor complete todos los campos");
      return;
    }
    try {
      const { error } = await supabase
        .from("products")
        .update({ name, price: parseFloat(price) })
        .eq("id", editingProduct.id);

      if (error) throw error;

      setName("");
      setPrice("");
      setEditingProduct(null);
      Alert.alert("Éxito", "Producto actualizado correctamente");
      fetchProducts();
    } catch (error) {
      Alert.alert("Error", "No se pudo actualizar el producto");
      console.error(error);
    }
  };

  const deleteProduct = async (id) => {
    Alert.alert(
      "Confirmar eliminación",
      "¿Está seguro que desea eliminar este producto?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              const { error } = await supabase
                .from("products")
                .delete()
                .eq("id", id);

              if (error) throw error;

              Alert.alert("Éxito", "Producto eliminado correctamente");
              fetchProducts();
            } catch (error) {
              Alert.alert("Error", "No se pudo eliminar el producto");
              console.error(error);
            }
          },
        },
      ]
    );
  };

  const formatPrice = (price) => {
    if (typeof price !== "number") return price;

    // Si el número no tiene decimales, mostrar sin decimales
    if (Number.isInteger(price)) {
      return price.toString();
    }

    // Si tiene decimales, mostrar solo si son necesarios
    return price.toFixed(2).replace(/\.?0+$/, "");
  };

  const renderItem = ({ item }) => (
    <View style={styles.productItem}>
      <View style={styles.productHeader}>
        <View style={styles.iconContainer}>
          <Icon name="shopping-bag" size={24} color="#666" />
        </View>
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{item.name}</Text>
          <View style={styles.infoRow}>
            <Icon name="attach-money" size={16} color="#666" />
            <Text style={styles.infoText}>${formatPrice(item.price)}</Text>
          </View>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => {
              setName(item.name);
              setPrice(item.price.toString());
              setEditingProduct(item);
            }}
          >
            <Icon name="edit" size={20} color="#0066CC" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => deleteProduct(item.id)}
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
          placeholder="Nombre del Producto"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />
        <TextInput
          placeholder="Precio del Producto"
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
          style={styles.input}
        />
        <TouchableOpacity
          style={styles.submitButton}
          onPress={editingProduct ? updateProduct : addProduct}
        >
          <Text style={styles.submitButtonText}>
            {editingProduct ? "Actualizar Producto" : "Agregar Producto"}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={products}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay productos registrados</Text>
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
  productItem: {
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
  productHeader: {
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
  productInfo: {
    flex: 1,
  },
  productName: {
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
    marginLeft: 8,
  },
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  editButton: {
    backgroundColor: "#E5F1FF",
  },
  deleteButton: {
    backgroundColor: "#FFE5E5",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
});

export default ProductosScreen;
