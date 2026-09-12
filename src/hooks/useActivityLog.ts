import {
  useEffect,
  useState,
} from "react";

import {
  getListActivity,
  type Activity,
} from "../services/activityService";

import { supabase } from "../lib/supabase";

type UseActivityLogReturn = {
  activities: Activity[];
  loading: boolean;
  error: string;
};

export const useActivityLog = (
  listId: string | undefined
): UseActivityLogReturn => {
  const [activities, setActivities] = useState<
    Activity[]
  >([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    const fetchActivity = async () => {
      if (!listId) {
        setError("List ID is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const data = await getListActivity(listId);

        setActivities(data);
      } catch (error) {
        console.error(
          "Error fetching activity:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Something went wrong while loading activity."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, [listId]);

  useEffect(() => {
    if (!listId) return;

    const channel = supabase
      .channel(`list-activity-${listId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "activity_log",
          filter: `list_id=eq.${listId}`,
        },
        (payload) => {
          const newActivity =
            payload.new as Activity;

          setActivities((currentActivities) => {
            const alreadyExists =
              currentActivities.some(
                (activity) =>
                  activity.id === newActivity.id
              );

            if (alreadyExists) {
              return currentActivities;
            }

            return [
              newActivity,
              ...currentActivities,
            ].slice(0, 50);
          });
        }
      )
      .subscribe((status) => {
        console.log(
          "Activity realtime status:",
          status
        );
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [listId]);

  return {
    activities,
    loading,
    error,
  };
};