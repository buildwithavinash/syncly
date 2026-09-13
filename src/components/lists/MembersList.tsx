import { useEffect, useState } from "react";
import Loader from "../common/Loader";
import { formatDisplayText } from "../../lib/formatters";
import { supabase } from "../../lib/supabase";

type Member = {
  user_id: string;
  name: string;
  role: string;
};

type MembersListProps = {
  listId: string;
  onlineUserIds: string[];
};

type Tab = "all" | "active";

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

const MembersList = ({ listId, onlineUserIds }: MembersListProps) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("all");

  const fetchMembers = async () => {
    try {
      setError("");

      const { data: membershipsData, error: membershipsError } =
        await supabase
          .from("list_members")
          .select("list_id, user_id, role")
          .eq("list_id", listId);

      if (membershipsError) {
        console.error("Error fetching memberships:", membershipsError);
        setError(membershipsError.message);
        return;
      }

      const memberships = membershipsData ?? [];

      if (memberships.length === 0) {
        setMembers([]);
        return;
      }

      const userIds = memberships.map((member) => member.user_id);

      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, name")
        .in("id", userIds);

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        setError(profilesError.message);
        return;
      }

      const profiles = profilesData ?? [];

      const membersWithNames = memberships.map((membership) => {
        const profile = profiles.find(
          (profile) => profile.id === membership.user_id
        );

        return {
          user_id: membership.user_id,
          name: profile?.name ?? "Cartify user",
          role: membership.role,
        };
      });

      setMembers(membersWithNames);
    } catch (err) {
      console.error("Unexpected error fetching members:", err);
      setError("Something went wrong while loading members.");
    }
  };

  useEffect(() => {
    const setupMembers = async () => {
      setLoading(true);
      await fetchMembers();
      setLoading(false);
    };

    setupMembers();

    const channel = supabase
      .channel(`list-members-${listId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "list_members",
          filter: `list_id=eq.${listId}`,
        },
        () => fetchMembers()
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "list_members",
          filter: `list_id=eq.${listId}`,
        },
        () => fetchMembers()
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "list_members" },
        () => fetchMembers()
      )
      .subscribe((status) => {
        console.log("Members realtime status:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [listId]);

  if (loading) {
    return <Loader label="Loading members..." />;
  }

  if (error) {
    return (
      <p className="rounded-md bg-danger-tint px-3 py-2 text-sm text-danger">
        {error}
      </p>
    );
  }

  if (members.length === 0) {
    return <p className="text-sm text-slate">No members found.</p>;
  }

  const activeMembers = members.filter((member) =>
    onlineUserIds.includes(member.user_id)
  );

  const visibleMembers = activeTab === "active" ? activeMembers : members;

  return (
    <div>
      <div className="mb-3 inline-flex rounded-full border border-border bg-surface p-1">
        <button
          type="button"
          onClick={() => setActiveTab("all")}
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
            activeTab === "all"
              ? "bg-accent text-white"
              : "text-slate hover:text-ink"
          }`}
        >
          All ({members.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("active")}
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
            activeTab === "active"
              ? "bg-accent text-white"
              : "text-slate hover:text-ink"
          }`}
        >
          Active now ({activeMembers.length})
        </button>
      </div>

      {visibleMembers.length === 0 ? (
        <p className="text-sm text-slate">No one is active right now.</p>
      ) : (
        <div className="flex flex-col divide-y divide-border rounded-lg border border-border">
          {visibleMembers.map((member) => {
            const isOnline = onlineUserIds.includes(member.user_id);

            return (
              <div
                key={member.user_id}
                className="flex items-center justify-between gap-3 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-tint text-xs font-medium text-accent-ink">
                      {getInitials(member.name)}
                    </span>

                    {isOnline && (
                      <span className="absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full border-2 border-bg bg-success" />
                    )}
                  </div>

                  <span className="text-sm text-ink">
                    {formatDisplayText(member.name)}
                  </span>
                </div>

                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs ${
                    member.role === "owner"
                      ? "bg-accent-tint text-accent-ink"
                      : "bg-surface text-slate"
                  }`}
                >
                  {member.role}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MembersList;