import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, Plus, ListChecks } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

type List = {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
  updated_at: string;
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
      } catch (err) {
        console.error("Unexpected error:", err);
        setError("Something went wrong. Try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchLists();
  }, [user]);

  if (loading) {
    return (
      <main className="relative min-h-screen px-gutter py-12">
        <Link
          to="/"
          aria-label="Back to Cartify"
          className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-border text-ink transition-colors hover:border-border-strong hover:bg-surface sm:left-6 sm:top-6"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>

        <div className="mx-auto max-w-container pt-14">
          <h1 className="font-display text-2xl text-ink">Your lists</h1>
          <p className="mt-6 text-sm text-slate">Loading your lists...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen px-gutter py-12">
      <Link
        to="/"
        aria-label="Back to Cartify"
        className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-border text-ink transition-colors hover:border-border-strong hover:bg-surface sm:left-6 sm:top-6"
      >
        <ArrowLeft className="h-4 w-4" />
      </Link>

      <div className="mx-auto max-w-container pt-14">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="font-display text-2xl text-ink">Your lists</h1>

          <Link
            to="/create-list"
            className="inline-flex items-center gap-1.5 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            New list
          </Link>
        </div>

        {error && (
          <p className="mb-6 rounded-md bg-danger-tint px-3 py-2 text-sm text-danger">
            {error}
          </p>
        )}

        {!error && lists.length === 0 && (
          <div className="flex flex-col items-center rounded-lg border border-dashed border-border-strong py-16 text-center">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-accent-tint">
              <ListChecks className="h-5 w-5 text-accent-ink" />
            </div>

            <h2 className="font-display text-lg text-ink">No lists yet</h2>
            <p className="mt-1.5 max-w-xs text-sm text-slate">
              Create your first list, or join someone else's with an invite
              link.
            </p>

            <Link
              to="/create-list"
              className="mt-5 inline-flex items-center gap-1.5 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              <Plus className="h-4 w-4" />
              Create a list
            </Link>
          </div>
        )}

        {lists.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {lists.map((list) => (
              <Link
                key={list.id}
                to={`/lists/${list.id}`}
                className="rounded-lg border border-border bg-bg p-4 transition-colors hover:border-border-strong"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-display text-base text-ink">
                    {list.name}
                  </h3>

                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs ${
                      list.role === "owner"
                        ? "bg-accent-tint text-accent-ink"
                        : "bg-surface text-slate"
                    }`}
                  >
                    {list.role}
                  </span>
                </div>

                <p className="mt-2 text-xs text-slate">
                  Created {new Date(list.created_at).toLocaleDateString()}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default MyListsPage;