import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";


type Member = {
  user_id: string;
  name: string;
  role: string;
};

type MembersListProps = {
  listId: string;
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
          name: profile?.name ?? "Syncly User",
          role: membership.role,
        };
      });

      setMembers(membersWithNames);
    } catch (error) {
      console.error("Unexpected error fetching members:", error);
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
      <section>
        <h2>Members</h2>
        <p>Loading members...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section>
        <h2>Members</h2>
        <p>{error}</p>
      </section>
    );
  }

  return (
    <section>
      <h2>Members</h2>

      {members.length === 0 ? (
        <p>No members found.</p>
      ) : (
        <ul>
          {members.map((member) => (
            <li key={member.user_id}>
              <strong>{member.name}</strong>
              <span> — {member.role}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default MembersList;