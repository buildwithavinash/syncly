import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import {
  ArrowLeft,
  Plus,
  ListChecks,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { updateListName, deleteList } from "../services/listService";
import Modal from "../components/common/Modal";
import ConfirmModal from "../components/common/ConfirmModal";
import Loader from "../components/common/Loader";

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

const CardMenu = ({
  list,
  onRename,
  onDelete,
}: {
  list: ListWithRole;
  onRename: (list: ListWithRole) => void;
  onDelete: (list: ListWithRole) => void;
}) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setOpen((current) => !current);
        }}
        aria-label="List options"
        className="flex h-7 w-7 items-center justify-center rounded-full text-slate transition-colors hover:bg-surface hover:text-ink"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {open && (
        <div
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
          className="absolute right-0 top-full z-40 mt-1 w-40 rounded-md border border-border bg-bg p-1.5"
        >
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onRename(list);
            }}
            className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-left text-sm text-ink transition-colors hover:bg-surface"
          >
            <Pencil className="h-3.5 w-3.5" />
            Rename
          </button>

          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onDelete(list);
            }}
            className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-left text-sm text-danger transition-colors hover:bg-danger-tint"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

const MyListsPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [lists, setLists] = useState<ListWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [pendingRename, setPendingRename] = useState<ListWithRole | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [renaming, setRenaming] = useState(false);

  const [pendingDelete, setPendingDelete] = useState<ListWithRole | null>(null);
  const [deleting, setDeleting] = useState(false);

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

  const handleOpenRename = (list: ListWithRole) => {
    setRenameValue(list.name);
    setPendingRename(list);
  };

  const handleConfirmRename = async () => {
    if (!pendingRename) return;

    const trimmedName = renameValue.trim();

    if (!trimmedName) return;

    try {
      setRenaming(true);

      const updated = await updateListName(pendingRename.id, trimmedName);

      setLists((current) =>
        current.map((list) =>
          list.id === updated.id ? { ...list, name: updated.name } : list
        )
      );

      setPendingRename(null);
      showToast("List renamed");
    } catch (err) {
      console.error("Error renaming list:", err);
      showToast("Couldn't rename list", "error");
    } finally {
      setRenaming(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;

    try {
      setDeleting(true);

      await deleteList(pendingDelete.id);

      setLists((current) =>
        current.filter((list) => list.id !== pendingDelete.id)
      );

      setPendingDelete(null);
      showToast("List deleted");
    } catch (err) {
      console.error("Error deleting list:", err);
      showToast("Couldn't delete list", "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <main className="mx-auto max-w-container px-gutter pb-24">
      <header className="sticky top-0 z-30 -mx-gutter flex items-center gap-3 border-b border-border bg-bg/90 px-gutter py-4 backdrop-blur">
        <Link
          to="/"
          aria-label="Back to Cartify"
          className="flex h-9 w-9 shrink-0 items-center justify-center text-ink transition-colors hover:text-slate"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>

        <h1 className="min-w-0 flex-1 truncate font-display text-xl text-ink sm:text-2xl">
          Your lists
        </h1>

        <Link
          to="/create-list"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          New list
        </Link>
      </header>

      {loading ? (
        <Loader label="Loading your lists..." centered />
      ) : (
        <div className="pt-6">
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
                Create your first list, or join someone else's with an
                invite link.
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
                    <h3 className="truncate font-display text-base text-ink">
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

                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-xs text-slate">
                      Created {new Date(list.created_at).toLocaleDateString()}
                    </p>

                    {list.role === "owner" && (
                      <CardMenu
                        list={list}
                        onRename={handleOpenRename}
                        onDelete={setPendingDelete}
                      />
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      <Modal
        isOpen={pendingRename !== null}
        onClose={() => setPendingRename(null)}
        title="Rename list"
      >
        <div className="flex flex-col gap-4">
          <input
            type="text"
            value={renameValue}
            onChange={(event) => setRenameValue(event.target.value)}
            autoFocus
            className="w-full rounded-md border border-border bg-bg px-3 py-2.5 text-sm text-ink placeholder:text-slate/70 transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
          />

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPendingRename(null)}
              disabled={renaming}
              className="flex-1 rounded-md border border-border py-2 text-sm text-ink transition-colors hover:border-border-strong disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleConfirmRename}
              disabled={renaming || !renameValue.trim()}
              className="flex-1 rounded-md bg-accent py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {renaming ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete this list?"
        description={
          pendingDelete
            ? `"${pendingDelete.name}" and everything in it will be permanently removed.`
            : ""
        }
        confirmLabel="Delete list"
        confirming={deleting}
      />
    </main>
  );
};

export default MyListsPage;