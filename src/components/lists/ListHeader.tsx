import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import {
  ArrowLeft,
  Users,
  History,
  Link2,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import { createListInvite } from "../../services/listService";
import { useToast } from "../../context/ToastContext";

type ListHeaderProps = {
  listId: string;
  isOwner: boolean;
  onlineCount: number;
  onOpenMembers: () => void;
  onOpenActivity: () => void;
  onOpenRename: () => void;
  onOpenDelete: () => void;
};

const ListHeader = ({
  listId,
  isOwner,
  onlineCount,
  onOpenMembers,
  onOpenActivity,
  onOpenRename,
  onOpenDelete,
}: ListHeaderProps) => {
  const [sharing, setSharing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  useEffect(() => {
    if (!menuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  const handleShare = async () => {
    try {
      setSharing(true);

      const link = await createListInvite(listId);
      await navigator.clipboard.writeText(link);

      showToast("Invite link copied");
    } catch (err) {
      console.error("Error creating invite:", err);
      showToast(
        err instanceof Error ? err.message : "Couldn't create invite link",
        "error"
      );
    } finally {
      setSharing(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 -mx-gutter flex items-center justify-between gap-2 border-b border-border bg-bg/90 px-gutter py-4 backdrop-blur">
      <Link
        to="/lists"
        aria-label="Back to my lists"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border text-ink transition-colors hover:border-border-strong hover:bg-surface"
      >
        <ArrowLeft className="h-4 w-4" />
      </Link>

      <div className="flex shrink-0 items-center gap-2">
        <div className="relative">
          <button
            type="button"
            onClick={onOpenMembers}
            aria-label={`View members (${onlineCount} active now)`}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-ink transition-colors hover:border-border-strong hover:bg-surface"
          >
            <Users className="h-4 w-4" />
          </button>

          {onlineCount > 0 && (
            <span className="pointer-events-none absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full border-2 border-bg bg-success px-0.5 text-[10px] font-medium leading-none text-white">
              {onlineCount > 99 ? "99+" : onlineCount}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={onOpenActivity}
          aria-label="View activity"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-ink transition-colors hover:border-border-strong hover:bg-surface"
        >
          <History className="h-4 w-4" />
        </button>

        {isOwner && (
          <button
            type="button"
            onClick={handleShare}
            disabled={sharing}
            aria-label="Copy invite link"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-ink transition-colors hover:border-border-strong hover:bg-surface disabled:opacity-60"
          >
            <Link2 className="h-4 w-4" />
          </button>
        )}

        {isOwner && (
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((current) => !current)}
              aria-label="List options"
              aria-expanded={menuOpen}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-ink transition-colors hover:border-border-strong hover:bg-surface"
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full z-40 mt-2 w-44 rounded-md border border-border bg-bg p-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onOpenRename();
                  }}
                  className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-left text-sm text-ink transition-colors hover:bg-surface"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Rename list
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onOpenDelete();
                  }}
                  className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-left text-sm text-danger transition-colors hover:bg-danger-tint"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete list
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default ListHeader;