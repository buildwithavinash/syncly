import { useState } from "react";

import { acceptListInvite } from "../services/inviteService";

type UseAcceptInviteReturn = {
  accepting: boolean;
  error: string;
  acceptInvite: (
    token: string
  ) => Promise<string | null>;
};

export const useAcceptInvite =
  (): UseAcceptInviteReturn => {
    const [accepting, setAccepting] =
      useState(false);

    const [error, setError] = useState("");

    const acceptInvite = async (
      token: string
    ): Promise<string | null> => {
      try {
        setAccepting(true);
        setError("");

        const listId =
          await acceptListInvite(token);

        return listId;
      } catch (error) {
        console.error(
          "Error accepting invite:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Unable to accept this invite."
        );

        return null;
      } finally {
        setAccepting(false);
      }
    };

    return {
      accepting,
      error,
      acceptInvite,
    };
  };