import { useState, type SubmitEvent } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, ListPlus } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const CreateListPage = () => {
  const [listName, setListName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const trimmedName = listName.trim();

    if (!trimmedName) {
      setError("Enter a list name.");
      return;
    }

    if (!user) {
      setError("You must be logged in to create a list.");
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("lists")
        .insert({
          name: trimmedName,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error("Create list error:", error);
        setError(error.message);
        return;
      }

      showToast("List created");
      navigate(`/lists/${data.id}`);
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen px-gutter py-12">
      <Link
        to="/lists"
        aria-label="Back to my lists"
        className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-border text-ink transition-colors hover:border-border-strong hover:bg-surface sm:left-6 sm:top-6"
      >
        <ArrowLeft className="h-4 w-4" />
      </Link>

      <div className="mx-auto flex max-w-sm flex-col justify-center pt-14">
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-accent-tint">
          <ListPlus className="h-5 w-5 text-accent-ink" />
        </div>

        <h1 className="font-display text-2xl text-ink">Start a new list</h1>
        <p className="mt-1.5 text-sm text-slate">
          Give it a name — you can invite people once it's created.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 flex flex-col gap-4"
          noValidate
        >
          <div>
            <label htmlFor="listName" className="mb-1.5 block text-sm text-ink">
              List name
            </label>

            <input
              id="listName"
              type="text"
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              placeholder="Weekend groceries"
              autoFocus
              className="w-full rounded-md border border-border bg-bg px-3 py-2.5 text-sm text-ink placeholder:text-slate/70 transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>

          {error && (
            <p className="rounded-md bg-danger-tint px-3 py-2 text-sm text-danger">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-md bg-accent py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Creating..." : "Create list"}
          </button>
        </form>
      </div>
    </main>
  );
};

export default CreateListPage;