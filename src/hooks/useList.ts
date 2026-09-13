import { useEffect, useState } from "react";
import {
  getList,
  updateListName,
  deleteList,
  type List,
} from "../services/listService";

type UseListReturn = {
  list: List | null;
  loading: boolean;
  error: string;
  renaming: boolean;
  deleting: boolean;
  renameList: (name: string) => Promise<boolean>;
  removeList: () => Promise<boolean>;
};

export const useList = (
  listId: string | undefined
): UseListReturn => {
  const [list, setList] = useState<List | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [renaming, setRenaming] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

  const renameList = async (name: string): Promise<boolean> => {
    if (!listId) return false;

    const trimmedName = name.trim();

    if (!trimmedName) return false;

    try {
      setRenaming(true);

      const updated = await updateListName(listId, trimmedName);

      setList(updated);

      return true;
    } catch (err) {
      console.error("Error renaming list:", err);
      return false;
    } finally {
      setRenaming(false);
    }
  };

  const removeList = async (): Promise<boolean> => {
    if (!listId) return false;

    try {
      setDeleting(true);

      await deleteList(listId);

      return true;
    } catch (err) {
      console.error("Error deleting list:", err);
      return false;
    } finally {
      setDeleting(false);
    }
  };

  return {
    list,
    loading,
    error,
    renaming,
    deleting,
    renameList,
    removeList,
  };
};