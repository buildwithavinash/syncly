import { supabase } from "../lib/supabase";

export type Activity = {
  id: string;
  list_id: string;
  user_id: string;
  action: string;
  item_id: string | null;

  metadata: {
    item_name?: string;
    old_name?: string;
    new_name?: string;
    quantity?: string | null;
    category?: string | null;
  } | null;

  created_at: string;
};

export const getListActivity = async (
  listId: string
): Promise<Activity[]> => {
  const { data, error } =
    await supabase
      .from("activity_log")
      .select("*")
      .eq("list_id", listId)
      .order("created_at", {
        ascending: false,
      })
      .limit(50);

  if (error) {
    throw error;
  }

  return data ?? [];
};