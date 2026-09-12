import { useState } from "react";

import { createListInvite } from "../../services/listService";

type ShareListProps = {
  listId: string;
  onError: (message: string) => void;
};

const ShareList = ({
  listId,
  onError,
}: ShareListProps) => {
  const [inviteLink, setInviteLink] =
    useState("");

  const [creatingInvite, setCreatingInvite] =
    useState(false);

  const [copyingInvite, setCopyingInvite] =
    useState(false);

  const handleCreateInvite = async () => {
    try {
      setCreatingInvite(true);
      onError("");

      const link = await createListInvite(
        listId
      );

      setInviteLink(link);
    } catch (error) {
      console.error(
        "Error creating invite:",
        error
      );

      onError(
        error instanceof Error
          ? error.message
          : "Something went wrong while creating the invite."
      );
    } finally {
      setCreatingInvite(false);
    }
  };

  const handleCopyInvite = async () => {
    if (!inviteLink) return;

    try {
      setCopyingInvite(true);
      onError("");

      await navigator.clipboard.writeText(
        inviteLink
      );
    } catch (error) {
      console.error(
        "Error copying invite:",
        error
      );

      onError(
        "Unable to copy the invite link."
      );
    } finally {
      setCopyingInvite(false);
    }
  };

  return (
    <section>
      <h2>Share List</h2>

      <button
        type="button"
        onClick={handleCreateInvite}
        disabled={creatingInvite}
      >
        {creatingInvite
          ? "Creating..."
          : "Create Invite Link"}
      </button>

      {inviteLink && (
        <div>
          <p>{inviteLink}</p>

          <button
            type="button"
            onClick={handleCopyInvite}
            disabled={copyingInvite}
          >
            {copyingInvite
              ? "Copied"
              : "Copy Link"}
          </button>
        </div>
      )}
    </section>
  );
};

export default ShareList;