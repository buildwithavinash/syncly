import { useEffect, useState } from "react";
import { Link } from "react-router";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

type List = {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
  updated_at: string;
};

type Membership = {
  list_id: string;
  user_id: string;
  role: string;
};

type ListWithRole = List & {
  role: string;
};

const MyListsPage = () => {
  const { user } = useAuth();

  const [lists, setLists] = useState<ListWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLists = async () => {
      if (!user) {
        setError("You must be logged in to view your lists.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const { data: listsData, error: listsError } = await supabase
          .from("lists")
          .select("*")
          .order("created_at", { ascending: false });

        if (listsError) {
          console.error("Fetch lists error:", listsError);
          setError(listsError.message);
          return;
        }

        const { data: membershipsData, error: membershipsError } =
          await supabase
            .from("list_members")
            .select("list_id, user_id, role")
            .eq("user_id", user.id);

        if (membershipsError) {
          console.error("Fetch memberships error:", membershipsError);
          setError(membershipsError.message);
          return;
        }

        const memberships = membershipsData ?? [];

        const listsWithRoles: ListWithRole[] = (listsData ?? []).map(
          (list) => {
            const membership = memberships.find(
              (item) => item.list_id === list.id
            );

            return {
              ...list,
              role:
                membership?.role ??
                (list.created_by === user.id ? "owner" : "member"),
            };
          }
        );

        setLists(listsWithRoles);
      } catch (error) {
        console.error("Unexpected error:", error);
        setError("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchLists();
  }, [user]);

  if (loading) {
    return (
      <main>
        <h1>My Lists</h1>
        <p>Loading your lists...</p>
      </main>
    );
  }

  return (
    <main>
      <div>
        <h1>My Lists</h1>

        <Link to="/create-list">Create New List</Link>
      </div>

      {error && <p>{error}</p>}

      {!error && lists.length === 0 && (
        <section>
          <h2>No lists yet</h2>

          <p>
            Create your first list or join someone else's list with an invite
            link.
          </p>

          <Link to="/create-list">Create a List</Link>
        </section>
      )}

      {lists.length > 0 && (
        <section>
          <h2>Your Lists</h2>

          <ul>
            {lists.map((list) => (
              <li key={list.id}>
                <Link to={`/lists/${list.id}`}>
                  <strong>{list.name}</strong>
                </Link>

                <span> — {list.role}</span>

                <p>
                  Created{" "}
                  {new Date(list.created_at).toLocaleDateString()}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
};

export default MyListsPage;