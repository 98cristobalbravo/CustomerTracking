import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
  Alert,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  SectionList,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialIcons";
import { fetchClientes } from "../api/clienteService";
import { fetchProductos } from "../api/productoService";
import { useTheme } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ViewShot from "react-native-view-shot";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

const ClienteItem = React.memo(({ item, onSelectCliente }) => {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      style={[styles.clienteItem, { borderBottomColor: colors.border }]}
      onPress={() => onSelectCliente(item)}
    >
      <View style={[styles.iconContainer, { backgroundColor: colors.primary }]}>
        <Icon name="person" size={24} color={colors.background} />
      </View>
      <View style={styles.clienteInfo}>
        <Text style={[styles.clienteName, { color: colors.text }]}>
          {item.name}
        </Text>
        <Text style={[styles.clientePhone, { color: colors.text }]}>
          {item.phone}
        </Text>
        <Text style={[styles.clienteAddress, { color: colors.text }]}>
          {item.address}
        </Text>
      </View>
    </TouchableOpacity>
  );
});

const ProductoItem = React.memo(({ item, onAgregarProducto }) => {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      style={[styles.productoItem, { borderBottomColor: colors.border }]}
      onPress={() => onAgregarProducto(item)}
    >
      <View style={[styles.iconContainer, { backgroundColor: colors.primary }]}>
        <Icon name="shopping-bag" size={24} color={colors.background} />
      </View>
      <View style={styles.productoInfo}>
        <Text style={[styles.productoName, { color: colors.text }]}>
          {item.name}
        </Text>
        <Text style={[styles.productoPrice, { color: colors.primary }]}>
          ${item.price}
        </Text>
      </View>
    </TouchableOpacity>
  );
});

const PedidoItem = React.memo(({ item, onVerDetalles }) => {
  const { colors } = useTheme();
  const total = item.productos.reduce(
    (sum, producto) => sum + producto.price * producto.cantidad,
    0
  );

  return (
    <TouchableOpacity
      style={[styles.pedidoItem, { backgroundColor: colors.card }]}
      onPress={() => onVerDetalles(item)}
    >
      <View style={styles.pedidoHeader}>
        <Text style={[styles.pedidoCliente, { color: colors.text }]}>
          {item.cliente}
        </Text>
        <Text style={[styles.pedidoTotal, { color: colors.primary }]}>
          ${total.toFixed(2)}
        </Text>
      </View>
      <Text style={[styles.pedidoFecha, { color: colors.text }]}>
        {item.fecha}
      </Text>
      <Text style={[styles.pedidoDireccion, { color: colors.text }]}>
        {item.direccion}
      </Text>
      <Text
        style={[
          styles.pedidoProductos,
          { color: item.productos.length === 0 ? colors.error : colors.text },
        ]}
      >
        {item.productos.length === 0
          ? "Agregar productos..."
          : `${item.productos.length} productos`}
      </Text>
      {item.productos.length > 0 && (
        <View style={styles.productosPreview}>
          {item.productos.slice(0, 3).map((producto, index) => (
            <Text
              key={index}
              style={[styles.productoPreview, { color: colors.text }]}
            >
              • {producto.name} (x{producto.cantidad})
            </Text>
          ))}
          {item.productos.length > 3 && (
            <Text style={[styles.productoPreview, { color: colors.text }]}>
              ...
            </Text>
          )}
        </View>
      )}
      <View style={styles.paymentMethodContainer}>
        <TouchableOpacity
          style={[
            styles.paymentMethodButton,
            item.paymentMethod === "efectivo" &&
              styles.paymentMethodButtonActive,
            { borderColor: colors.border },
          ]}
          onPress={() => item.setPaymentMethod("efectivo")}
        >
          <Text
            style={[
              styles.paymentMethodText,
              {
                color:
                  item.paymentMethod === "efectivo"
                    ? colors.primary
                    : colors.text,
              },
            ]}
          >
            Efectivo
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.paymentMethodButton,
            item.paymentMethod === "tarjeta" &&
              styles.paymentMethodButtonActive,
            { borderColor: colors.border },
          ]}
          onPress={() => item.setPaymentMethod("tarjeta")}
        >
          <Text
            style={[
              styles.paymentMethodText,
              {
                color:
                  item.paymentMethod === "tarjeta"
                    ? colors.primary
                    : colors.text,
              },
            ]}
          >
            Tarjeta
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.paymentMethodButton,
            item.paymentMethod === "otro" && styles.paymentMethodButtonActive,
            { borderColor: colors.border },
          ]}
          onPress={() => item.setPaymentMethod("otro")}
        >
          <Text
            style={[
              styles.paymentMethodText,
              {
                color:
                  item.paymentMethod === "otro" ? colors.primary : colors.text,
              },
            ]}
          >
            Otro
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
});

export default function Component() {
  const { colors } = useTheme();
  const [pedidos, setPedidos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [selectedPedido, setSelectedPedido] = useState(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.9));
  const viewShotRef = useRef(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [clientesData, productosData, storedPedidos] = await Promise.all([
        fetchClientes(),
        fetchProductos(),
        AsyncStorage.getItem("pedidos"),
      ]);
      setClientes(prepareClientesData(clientesData));
      setProductos(productosData);
      if (storedPedidos) {
        setPedidos(JSON.parse(storedPedidos));
      }
    } catch (error) {
      console.error("Error al cargar los datos:", error);
      Alert.alert(
        "Error",
        "No se pudieron cargar los datos. Por favor, intente de nuevo."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const savePedidos = async () => {
      try {
        await AsyncStorage.setItem("pedidos", JSON.stringify(pedidos));
      } catch (error) {
        console.error("Error al guardar los pedidos:", error);
      }
    };
    savePedidos();
  }, [pedidos]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const prepareClientesData = useCallback((data) => {
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
  }, []);

  const agregarPedido = useCallback((cliente) => {
    const fecha = new Date().toLocaleDateString();
    setPedidos((prevPedidos) => [
      ...prevPedidos,
      {
        cliente: cliente.name,
        productos: [],
        fecha: fecha,
        direccion: cliente.address || "Dirección no especificada",
        paymentMethod: null,
        setPaymentMethod: (method) => {
          setPedidos((prevPedidos) =>
            prevPedidos.map((p) =>
              p.cliente === cliente.name ? { ...p, paymentMethod: method } : p
            )
          );
        },
      },
    ]);
    setModalVisible(false);
    Alert.alert("Éxito", "Cliente agregado al pedido correctamente");
  }, []);

  const agregarProducto = useCallback(
    (producto) => {
      if (selectedPedido) {
        setPedidos((prevPedidos) => {
          const index = prevPedidos.findIndex((p) => p === selectedPedido);
          if (index !== -1) {
            const newPedidos = [...prevPedidos];
            const existingProductIndex = newPedidos[index].productos.findIndex(
              (p) => p.id === producto.id
            );
            if (existingProductIndex !== -1) {
              newPedidos[index].productos[existingProductIndex].cantidad += 1;
            } else {
              newPedidos[index].productos.push({ ...producto, cantidad: 1 });
            }
            return newPedidos;
          }
          return prevPedidos;
        });
        Alert.alert("Éxito", "Producto agregado al pedido");
      }
    },
    [selectedPedido]
  );

  const actualizarCantidadProducto = useCallback(
    (productoIndex, nuevaCantidad) => {
      if (selectedPedido) {
        setPedidos((prevPedidos) => {
          const index = prevPedidos.findIndex((p) => p === selectedPedido);
          if (index !== -1) {
            const newPedidos = [...prevPedidos];
            newPedidos[index].productos[productoIndex].cantidad = Math.max(
              1,
              nuevaCantidad
            );
            return newPedidos;
          }
          return prevPedidos;
        });
      }
    },
    [selectedPedido]
  );

  const eliminarProducto = useCallback(
    (productoIndex) => {
      if (selectedPedido) {
        setPedidos((prevPedidos) => {
          const index = prevPedidos.findIndex((p) => p === selectedPedido);
          if (index !== -1) {
            const newPedidos = [...prevPedidos];
            newPedidos[index].productos.splice(productoIndex, 1);
            return newPedidos;
          }
          return prevPedidos;
        });
        Alert.alert("Éxito", "Producto eliminado del pedido");
      }
    },
    [selectedPedido]
  );

  const eliminarPedido = useCallback(
    (pedidoAEliminar) => {
      setPedidos((prevPedidos) =>
        prevPedidos.filter((pedido) => pedido !== pedidoAEliminar)
      );
      hideModal();
      Alert.alert("Éxito", "Pedido eliminado correctamente");
    },
    [hideModal]
  );

  const renderSectionHeader = useCallback(
    ({ section: { title } }) => (
      <View
        style={[styles.sectionHeader, { backgroundColor: colors.background }]}
      >
        <Text style={[styles.sectionHeaderText, { color: colors.text }]}>
          {title}
        </Text>
      </View>
    ),
    [colors]
  );

  const showModal = useCallback(
    (type, pedido = null) => {
      setModalType(type);
      setSelectedPedido(pedido);
      setModalVisible(true);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 5,
          useNativeDriver: true,
        }),
      ]).start();
    },
    [fadeAnim, scaleAnim]
  );

  const hideModal = useCallback(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 0.9,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setModalVisible(false);
      setModalType(null);
      setSelectedPedido(null);
    });
  }, [fadeAnim, scaleAnim]);

  const captureAndShareImage = useCallback(async () => {
    try {
      console.log("Iniciando captura de imagen...");
      const uri = await viewShotRef.current.capture();
      console.log("Imagen capturada:", uri);

      if (!uri) {
        throw new Error("La captura de imagen falló: URI vacía");
      }

      const currentDate = new Date().toLocaleDateString();
      const fileName = `Pedidos_${currentDate.replace(/\//g, "-")}.jpg`;
      const filePath = `${FileSystem.cacheDirectory}${fileName}`;

      await FileSystem.copyAsync({
        from: uri,
        to: filePath,
      });

      console.log("Imagen copiada a:", filePath);

      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert(
          "Error",
          "El compartir no está disponible en este dispositivo"
        );
        return;
      }

      await Sharing.shareAsync(filePath, {
        mimeType: "image/jpeg",
        dialogTitle: "Compartir Pedidos",
        UTI: "public.jpeg",
      });

      console.log("Imagen compartida exitosamente");
    } catch (error) {
      console.error("Error al capturar o compartir imagen:", error);
      Alert.alert("Error", `No se pudo compartir la imagen: ${error.message}`);
    }
  }, []);

  const renderModal = () => (
    <Modal
      animationType="none"
      transparent={true}
      visible={modalVisible}
      onRequestClose={hideModal}
    >
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: "rgba(0, 0, 0, 0.5)" },
        ]}
      />
      <Animated.View
        style={[
          styles.modalContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View
          style={[styles.modalView, { backgroundColor: colors.background }]}
        >
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {modalType === "clientes"
                ? "Seleccionar Cliente"
                : modalType === "productos"
                ? "Agregar Producto"
                : modalType === "detallesPedido"
                ? "Detalles del Pedido"
                : ""}
            </Text>
            <TouchableOpacity style={styles.closeButton} onPress={hideModal}>
              <Icon name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          {modalType === "clientes" && (
            <SectionList
              sections={clientes}
              renderItem={({ item }) => (
                <ClienteItem item={item} onSelectCliente={agregarPedido} />
              )}
              renderSectionHeader={renderSectionHeader}
              keyExtractor={(item) => item.id.toString()}
            />
          )}
          {modalType === "productos" && (
            <FlatList
              data={productos}
              renderItem={({ item }) => (
                <ProductoItem item={item} onAgregarProducto={agregarProducto} />
              )}
              keyExtractor={(item) => item.id.toString()}
            />
          )}
          {modalType === "detallesPedido" && selectedPedido && (
            <View>
              <View style={styles.clienteHeaderContainer}>
                <Text
                  style={[styles.pedidoClienteName, { color: colors.text }]}
                >
                  {selectedPedido.cliente}
                </Text>
                <TouchableOpacity
                  onPress={() => eliminarPedido(selectedPedido)}
                >
                  <Icon name="delete" size={24} color={colors.error} />
                </TouchableOpacity>
              </View>
              <FlatList
                data={selectedPedido.productos}
                renderItem={({ item, index }) => (
                  <View
                    style={[
                      styles.productoEnPedido,
                      { borderBottomColor: colors.border },
                    ]}
                  >
                    <Text
                      style={[
                        styles.productoEnPedidoName,
                        { color: colors.text },
                      ]}
                    >
                      {item.name}
                    </Text>
                    <View style={styles.cantidadContainer}>
                      <TouchableOpacity
                        onPress={() =>
                          actualizarCantidadProducto(index, item.cantidad - 1)
                        }
                      >
                        <Icon name="remove" size={24} color={colors.primary} />
                      </TouchableOpacity>
                      <Text style={[styles.cantidad, { color: colors.text }]}>
                        {item.cantidad}
                      </Text>
                      <TouchableOpacity
                        onPress={() =>
                          actualizarCantidadProducto(index, item.cantidad + 1)
                        }
                      >
                        <Icon name="add" size={24} color={colors.primary} />
                      </TouchableOpacity>
                    </View>
                    <TouchableOpacity onPress={() => eliminarProducto(index)}>
                      <Icon name="delete" size={24} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                )}
                keyExtractor={(item, index) => index.toString()}
              />
              <TouchableOpacity
                style={[
                  styles.agregarProductoButton,
                  { backgroundColor: colors.primary },
                ]}
                onPress={() => {
                  setModalType("productos");
                }}
              >
                <Text
                  style={[
                    styles.agregarProductoButtonText,
                    { color: colors.background },
                  ]}
                >
                  Agregar Producto
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Animated.View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const totalPedidos = pedidos.reduce(
    (sum, pedido) =>
      sum +
      pedido.productos.reduce(
        (total, producto) => total + producto.price * producto.cantidad,
        0
      ),
    0
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ViewShot ref={viewShotRef} options={{ format: "jpg", quality: 0.9 }}>
        <View style={styles.headerContainer}>
          <Text style={[styles.dateHeader, { color: colors.text }]}>
            {new Date().toLocaleDateString()}
          </Text>
          <Text style={[styles.totalHeader, { color: colors.primary }]}>
            Total: ${totalPedidos.toFixed(2)}
          </Text>
        </View>
        <FlatList
          data={pedidos}
          renderItem={({ item }) => (
            <PedidoItem
              item={item}
              onVerDetalles={(pedido) => showModal("detallesPedido", pedido)}
            />
          )}
          keyExtractor={(item, index) => index.toString()}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.text }]}>
                No hay pedidos registrados
              </Text>
            </View>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
            />
          }
        />
      </ViewShot>
      <View style={styles.fixedButtonContainer}>
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: colors.primary }]}
          onPress={() => showModal("clientes")}
        >
          <Icon name="add" size={24} color={colors.background} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.exportButton, { backgroundColor: colors.primary }]}
          onPress={captureAndShareImage}
        >
          <Icon name="share" size={24} color={colors.background} />
          <Text style={[styles.exportButtonText, { color: colors.background }]}>
            Finalizar pedido y compartir
          </Text>
        </TouchableOpacity>
      </View>
      {renderModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
  },
  dateHeader: {
    fontSize: 18,
    fontWeight: "bold",
  },
  totalHeader: {
    fontSize: 18,
    fontWeight: "bold",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    textAlign: "center",
  },
  fixedButtonContainer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },
  exportButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 28,
    elevation: 4,
  },
  exportButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalView: {
    width: "90%",
    maxHeight: "80%",
    borderRadius: 20,
    padding: 20,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  closeButton: {
    padding: 5,
  },
  clienteItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  clienteInfo: {
    flex: 1,
  },
  clienteName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  clientePhone: {
    fontSize: 14,
  },
  clienteAddress: {
    fontSize: 14,
  },
  productoItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
  },
  productoInfo: {
    flex: 1,
  },
  productoName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  productoPrice: {
    fontSize: 14,
    fontWeight: "bold",
  },
  pedidoItem: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    marginHorizontal: 10,
  },
  pedidoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  pedidoCliente: {
    fontSize: 18,
    fontWeight: "bold",
  },
  pedidoTotal: {
    fontSize: 18,
    fontWeight: "bold",
  },
  pedidoFecha: {
    fontSize: 14,
    marginBottom: 5,
  },
  pedidoDireccion: {
    fontSize: 14,
    marginBottom: 5,
  },
  pedidoProductos: {
    fontSize: 14,
    marginBottom: 5,
  },
  productosPreview: {
    marginLeft: 10,
  },
  productoPreview: {
    fontSize: 12,
  },
  paymentMethodContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  paymentMethodButton: {
    flex: 1,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderRadius: 5,
    alignItems: "center",
    marginHorizontal: 2,
  },
  paymentMethodButtonActive: {
    backgroundColor: "rgba(0, 0, 0, 0.1)",
  },
  paymentMethodText: {
    fontSize: 12,
  },
  sectionHeader: {
    padding: 10,
  },
  sectionHeaderText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  clienteHeaderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  pedidoClienteName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  productoEnPedido: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  productoEnPedidoName: {
    flex: 1,
    fontSize: 16,
  },
  cantidadContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  cantidad: {
    fontSize: 16,
    marginHorizontal: 10,
  },
  agregarProductoButton: {
    marginTop: 20,
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  agregarProductoButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});
