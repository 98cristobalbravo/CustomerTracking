import { supabase } from "../api/supabaseClient";

export const fetchClientes = async () => {
  try {
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .order("name", { ascending: true });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error al cargar clientes:", error);
    throw error; // Propagamos el error para manejarlo en el componente
  }
};

export const addClient = async (name, phone, address) => {
  try {
    const { data, error } = await supabase
      .from("customers")
      .insert([{ name, phone, address }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error al agregar cliente:", error);
    throw error;
  }
};

export const updateClient = async (id, name, phone, address) => {
  try {
    const { data, error } = await supabase
      .from("customers")
      .update({ name, phone, address })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error al actualizar cliente:", error);
    throw error;
  }
};

export const deleteClient = async (id) => {
  try {
    const { error } = await supabase.from("customers").delete().eq("id", id);

    if (error) throw error;
  } catch (error) {
    console.error("Error al eliminar cliente:", error);
    throw error;
  }
};
