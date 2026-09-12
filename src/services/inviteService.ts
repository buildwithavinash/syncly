import { supabase } from "../lib/supabase";

export const acceptListInvite = async (
  token: string
): Promise<string> => {
  const { data, error } = await supabase.rpc(
    "accept_list_invite",
    {
      p_token: token,
    }
  );

  if (error) {
    throw error;
  }

  return data as string;
};