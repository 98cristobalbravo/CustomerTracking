// api/databaseService.js
import { supabase } from "../api/supabaseClient";

// PRODUCTOS CRUD

export const fetchProducts = async () => {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("name", { ascending: true });
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error al obtener productos:", error);
    throw error;
  }
};

export const addProduct = async (name, price) => {
  try {
    const { error } = await supabase
      .from("products")
      .insert([{ name, price: parseFloat(price) }]);
    if (error) throw error;
  } catch (error) {
    console.error("Error al agregar producto:", error);
    throw error;
  }
};

export const updateProduct = async (id, name, price) => {
  try {
    const { error } = await supabase
      .from("products")
      .update({ name, price: parseFloat(price) })
      .eq("id", id);
    if (error) throw error;
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    throw error;
  }
};

export const deleteProduct = async (id) => {
  try {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw error;
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    throw error;
  }
};
