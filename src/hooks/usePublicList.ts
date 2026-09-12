import { useEffect, useState } from "react";

import {
  getPublicListByInvite,
  type PublicListData,
} from "../services/publicListService";

type UsePublicListReturn = {
  data: PublicListData | null;
  loading: boolean;
  error: string;
};

export const usePublicList = (
  token: string | undefined
): UsePublicListReturn => {
  const [data, setData] =
    useState<PublicListData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPublicList = async () => {
      if (!token) {
        setError("Invite token is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const result =
          await getPublicListByInvite(token);

        setData(result);
      } catch (error) {
        console.error(
          "Error loading public list:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load this list."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPublicList();
  }, [token]);

  return {
    data,
    loading,
    error,
  };
};