import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { supabase } from "../../lib/supabase";

type Member = {
  user_id: string;
  name: string;
  role: string;
};

type MembersListProps = {
  listId: string;
};

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

const MembersList = ({ listId }: MembersListProps) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
        () => {
          fetchMembers();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "list_members",
          filter: `list_id=eq.${listId}`,
        },
        () => {
          fetchMembers();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "list_members",
        },
        () => {
          fetchMembers();
        }
      )
      .subscribe((status) => {
        console.log("Members realtime status:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [listId]);

  if (loading) {
    return (
      <section className="py-5">
        <h2 className="mb-3 text-sm font-medium text-ink">Members</h2>
        <p className="text-sm text-slate">Loading members...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-5">
        <h2 className="mb-3 text-sm font-medium text-ink">Members</h2>
        <p className="rounded-md bg-danger-tint px-3 py-2 text-sm text-danger">
          {error}
        </p>
      </section>
    );
  }

  return (
    <section className="py-5">
      <div className="mb-3 flex items-center gap-2">
        <Users className="h-4 w-4 text-slate" />
        <h2 className="text-sm font-medium text-ink">
          Members {members.length > 0 && `(${members.length})`}
        </h2>
      </div>

      {members.length === 0 ? (
        <p className="text-sm text-slate">No members found.</p>
      ) : (
        <div className="flex flex-col divide-y divide-border rounded-lg border border-border">
          {members.map((member) => (
            <div
              key={member.user_id}
              className="flex items-center justify-between gap-3 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-tint text-xs font-medium text-accent-ink">
                  {getInitials(member.name)}
                </span>
                <span className="text-sm text-ink">{member.name}</span>
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
          ))}
        </div>
      )}
    </section>
  );
};

export default MembersList;