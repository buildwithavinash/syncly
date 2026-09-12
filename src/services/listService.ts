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