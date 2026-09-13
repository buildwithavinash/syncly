import { supabase } from "../lib/supabase";

export type List = {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export const getList = async (
  listId: string
): Promise<List> => {
  const { data, error } = await supabase
    .from("lists")
    .select("*")
    .eq("id", listId)
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const createListInvite = async (
  listId: string
): Promise<string> => {
  const { data: token, error } = await supabase.rpc(
    "create_list_invite",
    {
      p_list_id: listId,
      p_expires_at: null,
    }
  );

  if (error) {
    throw error;
  }

  return `${window.location.origin}/invite/${token}`;
};

export const updateListName = async (
  listId: string,
  name: string
): Promise<List> => {
  const { data, error } = await supabase
    .from("lists")
    .update({ name })
    .eq("id", listId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const deleteList = async (listId: string): Promise<void> => {
  const { error } = await supabase.from("lists").delete().eq("id", listId);

  if (error) {
    throw error;
  }
};