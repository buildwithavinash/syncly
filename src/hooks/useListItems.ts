import {
  useEffect,
  useState,
  type SubmitEvent,
} from "react";

import {
  createItem,
  deleteItem,
  getListItems,
  updateItem,
  type Item,
} from "../services/itemService";

import { supabase } from "../lib/supabase";

type UseListItemsReturn = {
  items: Item[];
  loading: boolean;
  error: string;
  addingItem: boolean;

  addItem: (
    event: SubmitEvent<HTMLFormElement>,
    name: string,
    quantity: string,
    category: string
  ) => Promise<void>;

  toggleItem: (
    itemId: string,
    completed: boolean
  ) => Promise<void>;

  deleteItemById: (
    itemId: string
  ) => Promise<void>;
};

export const useListItems = (
  listId: string | undefined,
  userId: string | undefined
): UseListItemsReturn => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addingItem, setAddingItem] = useState(false);

  /*
   * Fetch items belonging to this list.
   */
  useEffect(() => {
    const fetchItems = async () => {
      if (!listId) {
        setError("List ID is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const data = await getListItems(listId);

        setItems(data);
      } catch (error) {
        console.error("Error fetching items:", error);

        setError(
          error instanceof Error
            ? error.message
            : "Something went wrong while loading items."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [listId]);

  /*
   * Subscribe to realtime item changes.
   */
  useEffect(() => {
    if (!listId) return;

    const channel = supabase
      .channel(`list-items-${listId}`)

      /*
       * INSERT
       *
       * Add new items received from Supabase
       * unless the item already exists locally.
       */
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "items",
          filter: `list_id=eq.${listId}`,
        },
        (payload) => {
          const newItem = payload.new as Item;

          setItems((currentItems) => {
            const alreadyExists = currentItems.some(
              (item) => item.id === newItem.id
            );

            if (alreadyExists) {
              return currentItems;
            }

            return [...currentItems, newItem];
          });
        }
      )

      /*
       * UPDATE
       *
       * Replace the matching item with
       * the updated database version.
       */
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "items",
          filter: `list_id=eq.${listId}`,
        },
        (payload) => {
          const updatedItem = payload.new as Item;

          setItems((currentItems) =>
            currentItems.map((item) =>
              item.id === updatedItem.id
                ? updatedItem
                : item
            )
          );
        }
      )

      /*
       * DELETE
       *
       * DELETE does not use a list_id filter because
       * we need the old row information.
       *
       * REPLICA IDENTITY FULL is enabled on the
       * items table for this to work.
       */
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "items",
        },
        (payload) => {
          const deletedItem = payload.old as {
            id: string;
          };

          setItems((currentItems) =>
            currentItems.filter(
              (item) => item.id !== deletedItem.id
            )
          );
        }
      )
      .subscribe((status) => {
        console.log(
          "Items realtime status:",
          status
        );
      });

    /*
     * Cleanup the realtime channel when the
     * component using this hook unmounts or
     * the list ID changes.
     */
    return () => {
      supabase.removeChannel(channel);
    };
  }, [listId]);

  /*
   * Add item with optimistic update.
   */
  const addItem = async (
    event: SubmitEvent<HTMLFormElement>,
    name: string,
    quantity: string,
    category: string
  ) => {
    event.preventDefault();

    if (!listId || !userId) return;

    const trimmedName = name.trim();
    const trimmedQuantity = quantity.trim();
    const trimmedCategory = category.trim();

    if (!trimmedName) return;

    /*
     * Generate the ID on the client.
     *
     * This allows the optimistic item and the
     * eventual database item to have the same ID.
     */
    const optimisticId = crypto.randomUUID();

    const now = new Date().toISOString();

    const optimisticItem: Item = {
      id: optimisticId,
      list_id: listId,
      name: trimmedName,
      quantity: trimmedQuantity || null,
      category: trimmedCategory || null,
      completed: false,
      created_by: userId,
      created_at: now,
      updated_at: now,
    };

    /*
     * Optimistic update.
     *
     * The item appears immediately without
     * waiting for Supabase.
     */
    setItems((currentItems) => [
      ...currentItems,
      optimisticItem,
    ]);

    try {
      setAddingItem(true);
      setError("");

      /*
       * Send the item to Supabase.
       */
      const savedItem = await createItem(
        optimisticItem
      );

      /*
       * Replace the temporary optimistic item
       * with the real database row.
       */
      setItems((currentItems) =>
        currentItems.map((item) =>
          item.id === optimisticId
            ? savedItem
            : item
        )
      );
    } catch (error) {
      console.error("Error adding item:", error);

      /*
       * Rollback.
       *
       * If Supabase rejects the insert, remove
       * the optimistic item.
       */
      setItems((currentItems) =>
        currentItems.filter(
          (item) => item.id !== optimisticId
        )
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to add item."
      );
    } finally {
      setAddingItem(false);
    }
  };

  /*
   * Toggle item's completed state with
   * optimistic update + rollback.
   */
  const toggleItem = async (
    itemId: string,
    completed: boolean
  ) => {
    const previousItem = items.find(
      (item) => item.id === itemId
    );

    if (!previousItem) return;

    /*
     * Optimistic update.
     */
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === itemId
          ? {
              ...item,
              completed,
            }
          : item
      )
    );

    try {
      setError("");

      await updateItem(
        itemId,
        completed
      );
    } catch (error) {
      console.error(
        "Error updating item:",
        error
      );

      /*
       * Rollback.
       */
      setItems((currentItems) =>
        currentItems.map((item) =>
          item.id === itemId
            ? {
                ...item,
                completed:
                  previousItem.completed,
              }
            : item
        )
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to update item."
      );
    }
  };

  /*
   * Delete item with optimistic update +
   * rollback.
   */
  const deleteItemById = async (
    itemId: string
  ) => {
    const previousItem = items.find(
      (item) => item.id === itemId
    );

    if (!previousItem) return;

    /*
     * Optimistically remove the item.
     */
    setItems((currentItems) =>
      currentItems.filter(
        (item) => item.id !== itemId
      )
    );

    try {
      setError("");

      await deleteItem(itemId);
    } catch (error) {
      console.error(
        "Error deleting item:",
        error
      );

      /*
       * Rollback.
       */
      setItems((currentItems) => [
        ...currentItems,
        previousItem,
      ]);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to delete item."
      );
    }
  };

  return {
    items,
    loading,
    error,
    addingItem,
    addItem,
    toggleItem,
    deleteItemById,
  };
};