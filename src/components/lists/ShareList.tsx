import { useState } from "react";
import { Link2, Copy, Check } from "lucide-react";
import { createListInvite } from "../../services/listService";
import { useToast } from "../../context/ToastContext";

type ShareListProps = {
  listId: string;
  onError: (message: string) => void;
};

const ShareList = ({ listId, onError }: ShareListProps) => {
  const [inviteLink, setInviteLink] = useState("");
  const [creatingInvite, setCreatingInvite] = useState(false);
  const [copied, setCopied] = useState(false);

  const { showToast } = useToast();

  const handleCreateInvite = async () => {
    try {
      setCreatingInvite(true);
      onError("");

      const link = await createListInvite(listId);

      setInviteLink(link);
    } catch (err) {
      console.error("Error creating invite:", err);

      onError(
        err instanceof Error
          ? err.message
          : "Something went wrong while creating the invite."
      );
    } finally {
      setCreatingInvite(false);
    }
  };

  const handleCopyInvite = async () => {
    if (!inviteLink) return;

    try {
      await navigator.clipboard.writeText(inviteLink);

      setCopied(true);
      showToast("Invite link copied");

      window.setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Error copying invite:", err);
      onError("Unable to copy the invite link.");
    }
  };

  return (
    <section className="py-5">
      <div className="mb-3 flex items-center gap-2">
        <Link2 className="h-4 w-4 text-slate" />
        <h2 className="text-sm font-medium text-ink">Share this list</h2>
      </div>

      {!inviteLink ? (
        <button
          type="button"
          onClick={handleCreateInvite}
          disabled={creatingInvite}
          className="rounded-md border border-border px-4 py-2 text-sm text-ink transition-colors hover:border-border-strong disabled:opacity-60"
        >
          {creatingInvite ? "Creating link..." : "Create invite link"}
        </button>
      ) : (
        <div className="flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2">
          <span className="flex-1 truncate text-sm text-slate">
            {inviteLink}
          </span>

          <button
            type="button"
            onClick={handleCopyInvite}
            className="flex shrink-0 items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                Copy
              </>
            )}
          </button>
        </div>
      )}
    </section>
  );
};

export default ShareList;