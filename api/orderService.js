// api/orderService.js
import { supabase } from "./supabaseClient";

export const createOrder = async (orderData) => {
  try {
    // Insert the order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        customer_id: orderData.customer_id,
        payment_method: orderData.payment_method,
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Insert order items
    const orderItems = orderData.order_items.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      subtotal: item.subtotal,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) throw itemsError;

    // Update customer's last_order_date
    const { error: customerError } = await supabase
      .from("customers")
      .update({ last_order_date: new Date().toISOString() })
      .eq("id", orderData.customer_id);

    if (customerError) throw customerError;

    return order;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
};

export const fetchOrders = async () => {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        customers (name, phone, address),
        order_items (
          quantity,
          subtotal,
          products (name, price)
        )
      `
      )
      .order("order_date", { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }
};

export const updateOrderStatus = async (orderId, newStatus) => {
  try {
    const { data, error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating order status:", error);
    throw error;
  }
};

export const createDailyDispatch = async (orderId, dispatchDate) => {
  try {
    const { data, error } = await supabase
      .from("daily_dispatch")
      .insert({
        order_id: orderId,
        dispatch_date: dispatchDate,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating daily dispatch:", error);
    throw error;
  }
};

export const updateDispatchStatus = async (dispatchId, dispatched) => {
  try {
    const { data, error } = await supabase
      .from("daily_dispatch")
      .update({ dispatched })
      .eq("id", dispatchId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating dispatch status:", error);
    throw error;
  }
};

export const fetchDailyDispatches = async (date) => {
  try {
    const { data, error } = await supabase
      .from("daily_dispatch")
      .select(
        `
        *,
        orders (
          *,
          customers (name, phone, address),
          order_items (
            quantity,
            subtotal,
            products (name, price)
          )
        )
      `
      )
      .eq("dispatch_date", date)
      .order("id", { ascending: true });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching daily dispatches:", error);
    throw error;
  }
};
