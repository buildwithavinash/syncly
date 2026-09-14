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

  editItem: (
    itemId: string,
    name: string,
    quantity: string,
    category: string
  ) => Promise<boolean>;

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
     * Cleanup realtime channel.
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
     */
    setItems((currentItems) => [
      ...currentItems,
      optimisticItem,
    ]);

    try {
      setAddingItem(true);
      setError("");

      const savedItem =
        await createItem(optimisticItem);

      /*
       * Replace optimistic item with
       * the real database row.
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
   * Toggle item completion with
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

      await updateItem(itemId, {
        completed,
      });
    } catch (error) {
      console.error(
        "Error updating item:",
        error
      );

      setItems((currentItems) =>
        currentItems.map((item) =>
          item.id === itemId
            ? previousItem
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
   * Edit item details with
   * optimistic update + rollback.
   */
  const editItem = async (
    itemId: string,
    name: string,
    quantity: string,
    category: string
  ): Promise<boolean> => {
    const previousItem = items.find(
      (item) => item.id === itemId
    );

    if (!previousItem) {
      return false;
    }

    const trimmedName = name.trim();
    const trimmedQuantity = quantity.trim();
    const trimmedCategory = category.trim();

    if (!trimmedName) {
      return false;
    }

    /*
     * Nothing changed.
     */
    if (
      trimmedName === previousItem.name &&
      (trimmedQuantity || null) ===
        previousItem.quantity &&
      (trimmedCategory || null) ===
        previousItem.category
    ) {
      return true;
    }

    /*
     * Optimistic update.
     */
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === itemId
          ? {
              ...item,
              name: trimmedName,
              quantity:
                trimmedQuantity || null,
              category:
                trimmedCategory || null,
            }
          : item
      )
    );

    try {
      setError("");

      await updateItem(itemId, {
        name: trimmedName,
        quantity:
          trimmedQuantity || null,
        category:
          trimmedCategory || null,
      });

      return true;
    } catch (error) {
      console.error(
        "Error editing item:",
        error
      );

      /*
       * Rollback.
       */
      setItems((currentItems) =>
        currentItems.map((item) =>
          item.id === itemId
            ? previousItem
            : item
        )
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to edit item."
      );

      return false;
    }
  };

  /*
   * Delete item with optimistic update
   * + rollback.
   */
  const deleteItemById = async (
    itemId: string
  ) => {
    const previousItem = items.find(
      (item) => item.id === itemId
    );

    if (!previousItem) return;

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
    editItem,
    deleteItemById,
  };
};