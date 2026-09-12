import { useEffect, useState } from "react";
import {
  getList,
  type List,
} from "../services/listService";

type UseListReturn = {
  list: List | null;
  loading: boolean;
  error: string;
};

export const useList = (
  listId: string | undefined
): UseListReturn => {
  const [list, setList] = useState<List | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchList = async () => {
      if (!listId) {
        setError("List ID is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const data = await getList(listId);

        setList(data);
      } catch (error) {
        console.error("Error fetching list:", error);

        setError(
          error instanceof Error
            ? error.message
            : "Something went wrong while loading the list."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchList();
  }, [listId]);

  return {
    list,
    loading,
    error,
  };
};