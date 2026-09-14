import { useEffect, useState } from "react";

import {
  Plus,
  Check,
  RotateCcw,
  Trash2,
  UserPlus,
  History,
  Pencil,
} from "lucide-react";

import Loader from "../common/Loader";
import { formatDisplayText } from "../../lib/formatters";
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

const ACTIVITY_ICONS: Record<
  string,
  typeof Plus
> = {
  item_added: Plus,
  item_completed: Check,
  item_uncompleted: RotateCcw,
  item_deleted: Trash2,
  item_renamed: Pencil,
  member_joined: UserPlus,
};

const ActivityLog = ({
  activities,
  loading,
  error,
}: ActivityLogProps) => {
  const [profileNames, setProfileNames] =
    useState<Record<string, string>>(
      {}
    );

  const [profilesLoading, setProfilesLoading] =
    useState(false);

  useEffect(() => {
    const loadProfileNames =
      async () => {
        const userIds = [
          ...new Set(
            activities.map(
              (activity) =>
                activity.user_id
            )
          ),
        ];

        if (userIds.length === 0) {
          setProfileNames({});
          return;
        }

        try {
          setProfilesLoading(true);

          const { data, error } =
            await supabase
              .from("profiles")
              .select("id, name")
              .in("id", userIds);

          if (error) {
            throw error;
          }

          const names: Record<
            string,
            string
          > = {};

          (
            data as ProfileName[]
          ).forEach((profile) => {
            names[profile.id] =
              profile.name;
          });

          setProfileNames(names);
        } catch (err) {
          console.error(
            "Error loading activity profile names:",
            err
          );
        } finally {
          setProfilesLoading(false);
        }
      };

    loadProfileNames();
  }, [activities]);

  const getUserName = (
    userId: string
  ) =>
    formatDisplayText(
      profileNames[userId]
    ) || "Cartify user";

  const getActivityMessage = (
    activity: Activity
  ) => {
    const userName =
      getUserName(
        activity.user_id
      );

    const itemName =
      formatDisplayText(
        activity.metadata?.item_name
      ) || "an item";

    switch (activity.action) {
      case "item_added":
        return `${userName} added "${itemName}"`;

      case "item_completed":
        return `${userName} completed "${itemName}"`;

      case "item_uncompleted":
        return `${userName} marked "${itemName}" as incomplete`;

      case "item_deleted":
        return `${userName} deleted "${itemName}"`;

      case "item_renamed": {
        const oldName =
          formatDisplayText(
            activity.metadata
              ?.old_name
          ) || "an item";

        const newName =
          formatDisplayText(
            activity.metadata
              ?.new_name
          ) || "an item";

        return `${userName} renamed "${oldName}" to "${newName}"`;
      }

      case "member_joined":
        return `${userName} joined the list`;

      default:
        return `${userName} performed an action`;
    }
  };

  if (
    loading ||
    profilesLoading
  ) {
    return (
      <Loader label="Loading activity..." />
    );
  }

  if (error) {
    return (
      <p className="rounded-md bg-danger-tint px-3 py-2 text-sm text-danger">
        {error}
      </p>
    );
  }

  if (activities.length === 0) {
    return (
      <p className="text-sm text-slate">
        No activity yet.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {activities.map(
        (activity) => {
          const Icon =
            ACTIVITY_ICONS[
              activity.action
            ] ?? History;

          return (
            <div
              key={activity.id}
              className="flex items-start gap-3"
            >
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface">
                <Icon className="h-3.5 w-3.5 text-slate" />
              </span>

              <div className="min-w-0">
                <p className="text-sm text-ink">
                  {getActivityMessage(
                    activity
                  )}
                </p>

                <p className="text-xs text-slate">
                  {new Date(
                    activity.created_at
                  ).toLocaleString()}
                </p>
              </div>
            </div>
          );
        }
      )}
    </div>
  );
};

export default ActivityLog;