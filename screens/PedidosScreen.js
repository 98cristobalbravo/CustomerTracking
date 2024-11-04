import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Button,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { fetchClientes } from "../api/clienteService";
import FormInput from "../components/FormInput";

export default function PedidosScreen() {
  const [pedidos, setPedidos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [expandedPedidoIndex, setExpandedPedidoIndex] = useState(null);

  // Cargar clientes desde la base de datos
  useEffect(() => {
    const loadClientes = async () => {
      try {
        const data = await fetchClientes();
        setClientes(data);
      } catch (error) {
        console.error("Error al cargar los clientes:", error);
      }
    };
    loadClientes();
  }, []);

  // Función para agregar un nuevo pedido
  const agregarPedido = () => {
    if (selectedCliente) {
      setPedidos([...pedidos, { cliente: selectedCliente, productos: [] }]);
      setSelectedCliente(null); // Limpiar selección después de agregar
    } else {
      alert("Por favor, selecciona un cliente");
    }
  };

  // Función para expandir o contraer el pedido
  const toggleExpandPedido = (index) => {
    setExpandedPedidoIndex(expandedPedidoIndex === index ? null : index);
  };

  // Función para agregar un producto al pedido
  const agregarProducto = (pedidoIndex) => {
    const newPedidos = [...pedidos];
    newPedidos[pedidoIndex].productos.push("Producto Nuevo");
    setPedidos(newPedidos);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Pedidos del Día</Text>

      {/* Selección de cliente */}
      <Text style={styles.label}>Selecciona un cliente:</Text>
      {clientes.map((cliente) => (
        <TouchableOpacity
          key={cliente.id}
          style={[
            styles.clienteButton,
            selectedCliente === cliente.name && styles.selectedClienteButton,
          ]}
          onPress={() => setSelectedCliente(cliente.name)}
        >
          <Text style={styles.clienteText}>{cliente.name}</Text>
        </TouchableOpacity>
      ))}

      <Button title="Agregar Pedido" onPress={agregarPedido} />

      {pedidos.map((pedido, index) => (
        <View key={index} style={styles.pedidoContainer}>
          <TouchableOpacity onPress={() => toggleExpandPedido(index)}>
            <Text style={styles.pedidoCliente}>{pedido.cliente}</Text>
          </TouchableOpacity>

          {/* Expandir o contraer productos */}
          {expandedPedidoIndex === index && (
            <View style={styles.productosContainer}>
              {pedido.productos.map((producto, prodIndex) => (
                <Text key={prodIndex} style={styles.productoText}>
                  {producto}
                </Text>
              ))}
              <Button
                title="Agregar Producto"
                onPress={() => agregarProducto(index)}
              />
            </View>
          )}
        </View>
      ))}

      <View style={styles.exportButtonContainer}>
        <Button
          title="Exportar como PDF"
          onPress={() => {
            /* Lógica de exportación */
          }}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 20, fontWeight: "bold", marginBottom: 20 },
  label: { fontSize: 16, fontWeight: "bold", marginVertical: 10 },
  clienteButton: {
    padding: 10,
    borderWidth: 1,
    borderRadius: 5,
    marginVertical: 5,
  },
  selectedClienteButton: {
    backgroundColor: "#DDDDDD",
  },
  clienteText: { fontSize: 16 },
  pedidoContainer: {
    marginBottom: 10,
    padding: 10,
    borderWidth: 1,
    borderRadius: 5,
  },
  pedidoCliente: { fontSize: 18, fontWeight: "bold" },
  productosContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
  },
  productoText: { fontSize: 16, marginBottom: 5 },
  exportButtonContainer: {
    marginVertical: 20,
  },
});
