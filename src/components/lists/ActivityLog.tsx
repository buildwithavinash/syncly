import { useEffect, useState } from "react";

import type { Activity } from "../../services/activityService";
import { supabase } from "../../lib/supabase";

type ActivityLogProps = {
  activities: Activity[];
  loading: boolean;
  error: string;
};

type ProfileName = {
  id: string;
  name: string;
};

const ActivityLog = ({
  activities,
  loading,
  error,
}: ActivityLogProps) => {
  const [profileNames, setProfileNames] = useState<
    Record<string, string>
  >({});

  const [profilesLoading, setProfilesLoading] =
    useState(false);

  useEffect(() => {
    const loadProfileNames = async () => {
      const userIds = [
        ...new Set(
          activities.map(
            (activity) => activity.user_id
          )
        ),
      ];

      if (userIds.length === 0) {
        setProfileNames({});
        return;
      }

      try {
        setProfilesLoading(true);

        const { data, error } = await supabase
          .from("profiles")
          .select("id, name")
          .in("id", userIds);

        if (error) {
          throw error;
        }

        const names: Record<string, string> = {};

        (data as ProfileName[]).forEach((profile) => {
          names[profile.id] = profile.name;
        });

        setProfileNames(names);
      } catch (error) {
        console.error(
          "Error loading activity profile names:",
          error
        );
      } finally {
        setProfilesLoading(false);
      }
    };

    loadProfileNames();
  }, [activities]);

  const getUserName = (userId: string) => {
    return (
      profileNames[userId] ??
      "Syncly User"
    );
  };

  const getActivityMessage = (
    activity: Activity
  ) => {
    const userName = getUserName(
      activity.user_id
    );

    const itemName =
      activity.metadata?.item_name ??
      "an item";

    switch (activity.action) {
      case "item_added":
        return `${userName} added "${itemName}"`;

      case "item_completed":
        return `${userName} completed "${itemName}"`;

      case "item_uncompleted":
        return `${userName} marked "${itemName}" as incomplete`;

      case "item_deleted":
        return `${userName} deleted "${itemName}"`;

      case "member_joined":
        return `${userName} joined the list`;

      default:
        return `${userName} performed an action`;
    }
  };

  if (loading) {
    return (
      <section>
        <h2>Activity</h2>
        <p>Loading activity...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section>
        <h2>Activity</h2>
        <p>{error}</p>
      </section>
    );
  }

  if (activities.length === 0) {
    return (
      <section>
        <h2>Activity</h2>
        <p>No activity yet.</p>
      </section>
    );
  }

  if (profilesLoading) {
    return (
      <section>
        <h2>Activity</h2>
        <p>Loading activity...</p>
      </section>
    );
  }

  return (
    <section>
      <h2>Activity</h2>

      <ul>
        {activities.map((activity) => (
          <li key={activity.id}>
            <p>{getActivityMessage(activity)}</p>

            <small>
              {new Date(
                activity.created_at
              ).toLocaleString()}
            </small>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default ActivityLog;