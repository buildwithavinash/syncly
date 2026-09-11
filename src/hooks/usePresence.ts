import { useEffect, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

type PresenceUser = {
  userId: string;
  name: string;
};

type UsePresenceReturn = {
  onlineUsers: PresenceUser[];
};

export const usePresence = (
  listId: string,
  userId: string,
  userName: string
): UsePresenceReturn => {
  const [onlineUsers, setOnlineUsers] = useState<PresenceUser[]>([]);

  useEffect(() => {
    if (!listId || !userId) return;

    let channel: RealtimeChannel;

    const setupPresence = async () => {
      channel = supabase.channel(`presence-list-${listId}`, {
        config: {
          presence: {
            key: userId,
          },
        },
      });

      channel.on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();

        const users: PresenceUser[] = [];

        Object.entries(state).forEach(([presenceKey, presences]) => {
          const presence = presences[0] as {
            userId?: string;
            name?: string;
          };

          if (presence.userId) {
            users.push({
              userId: presence.userId,
              name: presence.name ?? "Syncly User",
            });
          } else {
            users.push({
              userId: presenceKey,
              name: presence.name ?? "Syncly User",
            });
          }
        });

        setOnlineUsers(users);
      });

      await channel.subscribe(async (status) => {
        if (status !== "SUBSCRIBED") return;

        await channel.track({
          userId,
          name: userName,
        });
      });
    };

    setupPresence();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [listId, userId, userName]);

  return {
    onlineUsers,
  };
};