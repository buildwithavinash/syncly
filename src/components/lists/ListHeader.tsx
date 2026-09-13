import { useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, Users, History, Link2 } from "lucide-react";
import { createListInvite } from "../../services/listService";
import { useToast } from "../../context/ToastContext";

type ListHeaderProps = {
  listId: string;
  isOwner: boolean;
  onlineCount: number;
  onOpenMembers: () => void;
  onOpenActivity: () => void;
};

const ListHeader = ({
  listId,
  isOwner,
  onlineCount,
  onOpenMembers,
  onOpenActivity,
}: ListHeaderProps) => {
  const [sharing, setSharing] = useState(false);
  const { showToast } = useToast();

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
      </div>
    </header>
  );
};

export default ListHeader;