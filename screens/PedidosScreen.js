import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  StyleSheet,
  Alert,
  SafeAreaView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Share } from "react-native";
import { fetchClientes } from "../api/clienteService";
import { fetchProductos } from "../api/productoService";
import { createOrder } from "../api/orderService";

export default function PedidosScreen() {
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [pedidoActual, setPedidoActual] = useState({ clientes: [] });
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState("");
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    cargarDatos();
    cargarPedidoGuardado();
  }, []);

  useEffect(() => {
    guardarPedido();
  }, [pedidoActual]);

  const cargarDatos = async () => {
    try {
      const [clientesData, productosData] = await Promise.all([
        fetchClientes(),
        fetchProductos(),
      ]);
      setClientes(clientesData);
      setProductos(productosData);
    } catch (error) {
      Alert.alert("Error", "No se pudieron cargar los datos");
    }
  };

  const cargarPedidoGuardado = async () => {
    try {
      const pedidoGuardado = await AsyncStorage.getItem("pedidoActual");
      if (pedidoGuardado) {
        setPedidoActual(JSON.parse(pedidoGuardado));
      }
    } catch (error) {
      console.error("Error al cargar el pedido guardado:", error);
    }
  };

  const guardarPedido = async () => {
    try {
      await AsyncStorage.setItem("pedidoActual", JSON.stringify(pedidoActual));
    } catch (error) {
      console.error("Error al guardar el pedido:", error);
    }
  };

  const formatPrice = (price) => {
    return "$ " + price.toLocaleString("es-CL");
  };

  const agregarClienteAPedido = (cliente) => {
    if (pedidoActual.clientes.some((c) => c.id === cliente.id)) {
      Alert.alert(
        "Cliente ya agregado",
        "Este cliente ya está en el pedido actual."
      );
      return;
    }
    setPedidoActual((prevPedido) => ({
      ...prevPedido,
      clientes: [...prevPedido.clientes, { ...cliente, productos: [] }],
    }));
    setModalVisible(false);
  };

  const eliminarClienteDePedido = (clienteId) => {
    setPedidoActual((prevPedido) => ({
      ...prevPedido,
      clientes: prevPedido.clientes.filter(
        (cliente) => cliente.id !== clienteId
      ),
    }));
  };

  const agregarProductoACliente = (clienteIndex, producto) => {
    setPedidoActual((prevPedido) => {
      const nuevosPedidos = [...prevPedido.clientes];
      const clienteActual = nuevosPedidos[clienteIndex];
      const productoExistente = clienteActual.productos.find(
        (p) => p.id === producto.id
      );

      if (productoExistente) {
        productoExistente.cantidad += 1;
      } else {
        clienteActual.productos.push({ ...producto, cantidad: 1 });
      }

      Alert.alert(
        "Producto Agregado",
        `Se agregó "${producto.name}" al pedido de ${clienteActual.name}`,
        [{ text: "Aceptar" }]
      );

      return { ...prevPedido, clientes: nuevosPedidos };
    });
  };

  const eliminarProductoDeCliente = (clienteIndex, productoIndex) => {
    setPedidoActual((prevPedido) => {
      const nuevosPedidos = [...prevPedido.clientes];
      nuevosPedidos[clienteIndex].productos.splice(productoIndex, 1);
      return { ...prevPedido, clientes: nuevosPedidos };
    });
  };

  const actualizarCantidadProducto = (
    clienteIndex,
    productoIndex,
    nuevaCantidad
  ) => {
    setPedidoActual((prevPedido) => {
      const nuevosPedidos = [...prevPedido.clientes];
      nuevosPedidos[clienteIndex].productos[productoIndex].cantidad = Math.max(
        1,
        nuevaCantidad
      );
      return { ...prevPedido, clientes: nuevosPedidos };
    });
  };

  const calcularTotalPedido = () => {
    return pedidoActual.clientes.reduce((total, cliente) => {
      return (
        total +
        cliente.productos.reduce((subtotal, producto) => {
          return subtotal + producto.price * producto.cantidad;
        }, 0)
      );
    }, 0);
  };

  const compartirPedido = async () => {
    const pedidoTexto = pedidoActual.clientes
      .map((cliente) => {
        const productosCliente = cliente.productos
          .map(
            (p) =>
              `${p.name} x${p.cantidad} - ${formatPrice(p.price * p.cantidad)}`
          )
          .join("\n");
        const totalCliente = cliente.productos.reduce(
          (total, p) => total + p.price * p.cantidad,
          0
        );
        return `Cliente: ${cliente.name}\nDirección: ${
          cliente.address
        }\nProductos:\n${productosCliente}\nTotal: ${formatPrice(
          totalCliente
        )}\n`;
      })
      .join("\n");

    const mensaje = `Pedido del día ${new Date().toLocaleDateString()}:\n\n${pedidoTexto}\nTotal del pedido: ${formatPrice(
      calcularTotalPedido()
    )}`;

    try {
      await Share.share({ message: mensaje });
    } catch (error) {
      Alert.alert("Error", "No se pudo compartir el pedido");
    }
  };

  const finalizarPedido = async () => {
    try {
      if (pedidoActual.clientes.length === 0) {
        Alert.alert("Error", "No hay clientes en el pedido actual");
        return;
      }

      const orderData = {
        customer_id: pedidoActual.clientes[0].id,
        order_items: pedidoActual.clientes[0].productos.map((producto) => ({
          product_id: producto.id,
          quantity: producto.cantidad,
          subtotal: producto.price * producto.cantidad,
        })),
        total: calcularTotalPedido(),
        payment_method: "efectivo", // You might want to add a payment method selection in the UI
      };

      const savedOrder = await createOrder(orderData);

      if (savedOrder) {
        await compartirPedido();
        setPedidoActual({ clientes: [] });
        Alert.alert("Éxito", "Pedido guardado y compartido correctamente");
      } else {
        throw new Error("No se pudo guardar el pedido");
      }
    } catch (error) {
      console.error("Error al finalizar el pedido:", error);
      Alert.alert("Error", "No se pudo finalizar el pedido");
    }
  };

  const renderClienteItem = ({ item }) => (
    <TouchableOpacity
      style={styles.clienteItem}
      onPress={() => agregarClienteAPedido(item)}
    >
      <Text style={styles.clienteName}>{item.name}</Text>
      <Text style={styles.clienteInfo}>{item.phone}</Text>
      <Text style={styles.clienteInfo}>{item.address}</Text>
    </TouchableOpacity>
  );

  const renderProductoItem = ({ item, clienteIndex }) => (
    <TouchableOpacity
      style={styles.productoItem}
      onPress={() => agregarProductoACliente(clienteIndex, item)}
    >
      <Text style={styles.productoName}>{item.name}</Text>
      <Text style={styles.productoPrice}>{formatPrice(item.price)}</Text>
    </TouchableOpacity>
  );

  const renderPedidoClienteItem = ({ item, index: clienteIndex }) => (
    <View style={styles.pedidoClienteItem}>
      <View style={styles.pedidoClienteHeader}>
        <View>
          <Text style={styles.pedidoClienteName}>{item.name}</Text>
          <Text style={styles.pedidoClienteAddress}>{item.address}</Text>
        </View>
        <TouchableOpacity
          style={styles.eliminarClienteButton}
          onPress={() => eliminarClienteDePedido(item.id)}
        >
          <Text style={styles.eliminarClienteButtonText}>X</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.productosContainer}>
        {item.productos.map((producto, productoIndex) => (
          <View
            key={`${producto.id}-${productoIndex}`}
            style={styles.pedidoProductoItem}
          >
            <View style={styles.productoMainInfo}>
              <Text style={styles.productoNombre}>{producto.name}</Text>
              <Text style={styles.productoPrecio}>
                {formatPrice(producto.price)}
              </Text>
            </View>
            <View style={styles.productoControls}>
              <TouchableOpacity
                style={styles.cantidadButton}
                onPress={() =>
                  actualizarCantidadProducto(
                    clienteIndex,
                    productoIndex,
                    producto.cantidad - 1
                  )
                }
              >
                <Text style={styles.cantidadButtonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.cantidadText}>{producto.cantidad}</Text>
              <TouchableOpacity
                style={styles.cantidadButton}
                onPress={() =>
                  actualizarCantidadProducto(
                    clienteIndex,
                    productoIndex,
                    producto.cantidad + 1
                  )
                }
              >
                <Text style={styles.cantidadButtonText}>+</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  eliminarProductoDeCliente(clienteIndex, productoIndex)
                }
              >
                <Text style={styles.eliminarProductoButtonText}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={styles.agregarProductoButton}
        onPress={() => {
          setModalType("productos");
          setModalVisible(true);
        }}
      >
        <Text style={styles.agregarProductoButtonText}>Agregar Producto</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Pedidos del Día</Text>
          <Text style={styles.date}>
            {new Date().toLocaleDateString("es-CL")}
          </Text>
        </View>
        <Text style={styles.total}>
          Total: {formatPrice(calcularTotalPedido())}
        </Text>
      </View>

      <FlatList
        data={pedidoActual.clientes}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        renderItem={renderPedidoClienteItem}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No hay clientes en el pedido actual
          </Text>
        }
        contentContainerStyle={styles.pedidosList}
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            setModalType("clientes");
            setModalVisible(true);
          }}
        >
          <Text style={styles.buttonText}>Agregar Cliente</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={finalizarPedido}>
          <Text style={styles.buttonText}>Finalizar y Compartir Pedido</Text>
        </TouchableOpacity>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalView}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {modalType === "clientes"
                ? "Seleccionar Cliente"
                : "Agregar Producto"}
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>X</Text>
            </TouchableOpacity>
          </View>

          {modalType === "clientes" && (
            <View style={styles.modalContent}>
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar cliente"
                value={busqueda}
                onChangeText={setBusqueda}
              />
              <FlatList
                data={clientes.filter((cliente) =>
                  cliente.name.toLowerCase().includes(busqueda.toLowerCase())
                )}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderClienteItem}
              />
            </View>
          )}

          {modalType === "productos" && (
            <FlatList
              data={productos}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) =>
                renderProductoItem({
                  item,
                  clienteIndex: pedidoActual.clientes.length - 1,
                })
              }
            />
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e1e1e1",
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  date: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  total: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#007AFF",
  },
  pedidosList: {
    padding: 16,
  },
  pedidoClienteItem: {
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pedidoClienteHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  pedidoClienteName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  pedidoClienteAddress: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  eliminarClienteButton: {
    backgroundColor: "#FF3B30",
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  eliminarClienteButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  productosContainer: {
    borderTopWidth: 1,
    borderTopColor: "#e1e1e1",
    paddingTop: 12,
  },
  pedidoProductoItem: {
    flexDirection: "column",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e1e1e1",
  },
  productoMainInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  productoNombre: {
    fontSize: 16,
    flex: 1,
  },
  productoPrecio: {
    fontSize: 16,
    fontWeight: "500",
    minWidth: 80,
    textAlign: "right",
  },
  productoControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  cantidadButton: {
    backgroundColor: "#f0f0f0",
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  cantidadButtonText: {
    fontSize: 18,
    fontWeight: "600",
  },
  cantidadText: {
    fontSize: 16,
    marginHorizontal: 12,
    minWidth: 24,
    textAlign: "center",
  },
  eliminarProductoButtonText: {
    color: "#FF3B30",
    fontSize: 14,
    marginLeft: 16,
  },
  agregarProductoButton: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  agregarProductoButtonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#e1e1e1",
  },
  button: {
    flex: 1,
    backgroundColor: "#007AFF",
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 4,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
  modalView: {
    flex: 1,
    backgroundColor: "white",
    marginTop: 50,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e1e1e1",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#666",
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  searchInput: {
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  clienteItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e1e1e1",
  },
  clienteName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  clienteInfo: {
    fontSize: 14,
    color: "#666",
  },
  productoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e1e1e1",
  },
  productoName: {
    fontSize: 16,
    flex: 1,
  },
  productoPrice: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
    marginTop: 32,
  },
});
