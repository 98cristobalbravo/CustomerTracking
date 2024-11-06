import { StyleSheet } from "react-native";

const pedidosStyles = StyleSheet.create({
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

export default pedidosStyles;
