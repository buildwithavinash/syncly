import { supabase } from "../lib/supabase";

export type PublicListItem = {
  id: string;
  name: string;
  quantity: string | null;
  category: string | null;
  completed: boolean;
};

export type PublicList = {
  id: string;
  name: string;
};

export type PublicListData = {
  list: PublicList;
  items: PublicListItem[];
  is_member: boolean;
};

export const getPublicListByInvite = async (
  token: string
): Promise<PublicListData> => {
  const { data, error } = await supabase.rpc(
    "get_public_list_by_invite",
    {
      p_token: token,
    }
  );

  if (error) {
    throw error;
  }

  return data as PublicListData;
};