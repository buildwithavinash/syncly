import { supabase } from "../lib/supabase";

export type Item = {
  id: string;
  list_id: string;
  name: string;
  quantity: string | null;
  category: string | null;
  completed: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type ItemUpdate = {
  name?: string;
  quantity?: string | null;
  category?: string | null;
  completed?: boolean;
};

export const getListItems = async (
  listId: string
): Promise<Item[]> => {
  const { data, error } = await supabase
    .from("items")
    .select("*")
    .eq("list_id", listId)
    .order("created_at", {
      ascending: true,
    });

  if (error) {
    throw error;
  }

  return data ?? [];
};

export const createItem = async (
  item: Item
): Promise<Item> => {
  const { data, error } = await supabase
    .from("items")
    .insert({
      id: item.id,
      list_id: item.list_id,
      name: item.name,
      quantity: item.quantity,
      category: item.category,
      completed: item.completed,
      created_by: item.created_by,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const updateItem = async (
  itemId: string,
  updates: ItemUpdate
): Promise<void> => {
  const { error } = await supabase
    .from("items")
    .update(updates)
    .eq("id", itemId);

  if (error) {
    throw error;
  }
};

export const deleteItem = async (
  itemId: string
): Promise<void> => {
  const { error } = await supabase
    .from("items")
    .delete()
    .eq("id", itemId);

  if (error) {
    throw error;
  }
};