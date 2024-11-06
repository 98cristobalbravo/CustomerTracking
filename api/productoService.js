import { supabase } from "./supabaseClient";

export const fetchProductos = async () => {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("name", { ascending: true });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error al cargar productos:", error);
    throw error;
  }
};

export const addProducto = async (name, price) => {
  try {
    const { data, error } = await supabase
      .from("products")
      .insert([{ name, price }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error al agregar producto:", error);
    throw error;
  }
};

export const updateProducto = async (id, name, price) => {
  try {
    const { data, error } = await supabase
      .from("products")
      .update({ name, price })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    throw error;
  }
};

export const deleteProducto = async (id) => {
  try {
    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) throw error;
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    throw error;
  }
};
