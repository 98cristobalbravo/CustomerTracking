import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SectionList,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import FormInput from "../components/FormInput";
import {
  fetchProducts,
  addProduct,
  updateProduct,
  deleteProduct,
} from "../api/databaseService";
import globalStyles from "../styles/globalStyles";

const ProductosScreen = () => {
  const [products, setProducts] = useState([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const prepareProductsData = (data) => {
    const sortedProducts = [...data].sort((a, b) =>
      a.name.localeCompare(b.name, "es", { sensitivity: "base" })
    );

    const grouped = sortedProducts.reduce((acc, product) => {
      const firstLetter = product.name.charAt(0).toUpperCase();
      if (!acc[firstLetter]) {
        acc[firstLetter] = [];
      }
      acc[firstLetter].push(product);
      return acc;
    }, {});

    return Object.keys(grouped)
      .sort()
      .map((letter) => ({
        title: letter,
        data: grouped[letter],
      }));
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await fetchProducts();
      setProducts(prepareProductsData(data || []));
    } catch (error) {
      Alert.alert("Error", "No se pudieron cargar los productos");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadProducts();
  }, []);

  const resetForm = () => {
    setName("");
    setPrice("");
    setEditingProduct(null);
  };

  const handleAddProduct = async () => {
    if (!name.trim() || !price.trim()) {
      Alert.alert("Error", "Por favor complete todos los campos");
      return;
    }
    try {
      await addProduct(name.trim(), price.trim());
      resetForm();
      Alert.alert("Éxito", "Producto agregado correctamente");
      loadProducts();
    } catch (error) {
      Alert.alert("Error", "No se pudo agregar el producto");
    }
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct || !name.trim() || !price.trim()) {
      Alert.alert("Error", "Por favor complete todos los campos");
      return;
    }
    try {
      await updateProduct(editingProduct.id, name.trim(), price.trim());
      resetForm();
      Alert.alert("Éxito", "Producto actualizado correctamente");
      loadProducts();
    } catch (error) {
      Alert.alert("Error", "No se pudo actualizar el producto");
    }
  };

  const handleDeleteProduct = async (id) => {
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
              await deleteProduct(id);
              Alert.alert("Éxito", "Producto eliminado correctamente");
              loadProducts();
            } catch (error) {
              Alert.alert("Error", "No se pudo eliminar el producto");
            }
          },
        },
      ]
    );
  };

  const formatPrice = (price) => {
    if (typeof price !== "number") return price;
    return Number.isInteger(price)
      ? price.toString()
      : price.toFixed(2).replace(/\.?0+$/, "");
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
          <Icon name="shopping-bag" size={24} color="#666" />
        </View>
        <View style={globalStyles.itemInfo}>
          <Text style={globalStyles.itemName}>{item.name}</Text>
          <View style={globalStyles.infoRow}>
            <Icon name="attach-money" size={16} color="#666" />
            <Text style={globalStyles.infoText}>{formatPrice(item.price)}</Text>
          </View>
        </View>
        <View style={globalStyles.actionButtons}>
          <TouchableOpacity
            style={[globalStyles.actionButton, globalStyles.editButton]}
            onPress={() => {
              setName(item.name);
              setPrice(item.price.toString());
              setEditingProduct(item);
            }}
          >
            <Icon name="edit" size={20} color="#0066CC" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[globalStyles.actionButton, globalStyles.deleteButton]}
            onPress={() => handleDeleteProduct(item.id)}
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
          placeholder="Nombre del producto"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />
        <FormInput
          placeholder="Precio del producto"
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
        />
        <TouchableOpacity
          style={[
            globalStyles.submitButton,
            (!name.trim() || !price.trim()) && globalStyles.disabledButton,
          ]}
          onPress={editingProduct ? handleUpdateProduct : handleAddProduct}
          disabled={!name.trim() || !price.trim()}
        >
          <Text style={globalStyles.submitButtonText}>
            {editingProduct ? "Actualizar Producto" : "Agregar Producto"}
          </Text>
        </TouchableOpacity>
        {editingProduct && (
          <TouchableOpacity
            style={globalStyles.cancelButton}
            onPress={resetForm}
          >
            <Text style={globalStyles.cancelButtonText}>Cancelar Edición</Text>
          </TouchableOpacity>
        )}
      </View>

      <SectionList
        sections={products}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={globalStyles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={globalStyles.emptyContainer}>
            <Text style={globalStyles.emptyText}>
              No hay productos registrados
            </Text>
          </View>
        }
        stickySectionHeadersEnabled
      />
    </View>
  );
};

export default ProductosScreen;
