import { useEffect, useState, type SubmitEvent } from "react";
import { Link, useParams } from "react-router";

import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { usePresence } from "../hooks/usePresence";
import MembersList from "../components/lists/MembersList";

type List = {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
  updated_at: string;
};

type Item = {
  id: string;
  list_id: string;
  name: string;
  quantity: string | null;
  category: string | null;
  completed: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
};

const ListPage = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const [list, setList] = useState<List | null>(null);
  const [items, setItems] = useState<Item[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [category, setCategory] = useState("");

  const [addingItem, setAddingItem] = useState(false);

  const [inviteLink, setInviteLink] = useState("");
  const [creatingInvite, setCreatingInvite] = useState(false);
  const [copyingInvite, setCopyingInvite] = useState(false);

  const userName = user?.user_metadata?.name ?? "Syncly User";

  const { onlineUsers } = usePresence(
    id ?? "",
    user?.id ?? "",
    userName
  );

  /*
   * Fetch the list and its items.
   */
  useEffect(() => {
    const fetchListData = async () => {
      if (!id) {
        setError("List ID is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        /*
         * Fetch the list.
         */
        const { data: listData, error: listError } = await supabase
          .from("lists")
          .select("*")
          .eq("id", id)
          .single();

        if (listError) {
          console.error("Error fetching list:", listError);
          setError(listError.message);
          return;
        }

        setList(listData);

        /*
         * Fetch the items belonging to this list.
         */
        const { data: itemsData, error: itemsError } = await supabase
          .from("items")
          .select("*")
          .eq("list_id", id)
          .order("created_at", { ascending: true });

        if (itemsError) {
          console.error("Error fetching items:", itemsError);
          setError(itemsError.message);
          return;
        }

        setItems(itemsData ?? []);
      } catch (error) {
        console.error("Unexpected error fetching list:", error);
        setError("Something went wrong while loading the list.");
      } finally {
        setLoading(false);
      }
    };

    fetchListData();
  }, [id]);

  /*
   * Subscribe to realtime item changes.
   */
  useEffect(() => {
    if (!id) return;

    const channel = supabase
      .channel(`list-items-${id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "items",
          filter: `list_id=eq.${id}`,
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
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "items",
          filter: `list_id=eq.${id}`,
        },
        (payload) => {
          const updatedItem = payload.new as Item;

          setItems((currentItems) =>
            currentItems.map((item) =>
              item.id === updatedItem.id ? updatedItem : item
            )
          );
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "items",
        },
        (payload) => {
          const deletedItem = payload.old as { id: string };

          setItems((currentItems) =>
            currentItems.filter((item) => item.id !== deletedItem.id)
          );
        }
      )
      .subscribe((status) => {
        console.log("Items realtime status:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  /*
   * Add a new item.
   */
  const handleAddItem = async (
    event: SubmitEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!id || !user) return;

    const trimmedName = itemName.trim();
    const trimmedQuantity = quantity.trim();
    const trimmedCategory = category.trim();

    if (!trimmedName) {
      return;
    }

    try {
      setAddingItem(true);
      setError("");

      const { error } = await supabase.from("items").insert({
        list_id: id,
        name: trimmedName,
        quantity: trimmedQuantity || null,
        category: trimmedCategory || null,
        completed: false,
        created_by: user.id,
      });

      if (error) {
        console.error("Error adding item:", error);
        setError(error.message);
        return;
      }

      setItemName("");
      setQuantity("");
      setCategory("");
    } catch (error) {
      console.error("Unexpected error adding item:", error);
      setError("Something went wrong while adding the item.");
    } finally {
      setAddingItem(false);
    }
  };

  /*
   * Toggle an item's completed state.
   *
   * This uses an optimistic update:
   *
   * 1. Update the UI immediately.
   * 2. Send the request to Supabase.
   * 3. If Supabase fails, restore the previous value.
   */
  const handleToggleItem = async (
    itemId: string,
    completed: boolean
  ) => {
    const previousItem = items.find(
      (item) => item.id === itemId
    );

    if (!previousItem) return;

    /*
     * Optimistic update.
     *
     * The UI changes immediately without waiting
     * for Supabase.
     */
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === itemId
          ? { ...item, completed }
          : item
      )
    );

    /*
     * Send the change to Supabase.
     */
    const { error } = await supabase
      .from("items")
      .update({ completed })
      .eq("id", itemId);

    /*
     * Rollback if the request failed.
     */
    if (error) {
      console.error("Error updating item:", error);

      setItems((currentItems) =>
        currentItems.map((item) =>
          item.id === itemId
            ? {
                ...item,
                completed: previousItem.completed,
              }
            : item
        )
      );
    }
  };

  /*
   * Delete an item.
   */
  const handleDeleteItem = async (itemId: string) => {
    const { error } = await supabase
      .from("items")
      .delete()
      .eq("id", itemId);

    if (error) {
      console.error("Error deleting item:", error);
      setError(error.message);
    }
  };

  /*
   * Create an invite link.
   */
  const handleCreateInvite = async () => {
    if (!id) return;

    try {
      setCreatingInvite(true);
      setError("");

      const { data: token, error } = await supabase.rpc(
        "create_list_invite",
        {
          p_list_id: id,
          p_expires_at: null,
        }
      );

      if (error) {
        console.error("Create invite error:", error);
        setError(error.message);
        return;
      }

      const link = `${window.location.origin}/invite/${token}`;

      setInviteLink(link);
    } catch (error) {
      console.error("Unexpected error creating invite:", error);
      setError("Something went wrong while creating the invite.");
    } finally {
      setCreatingInvite(false);
    }
  };

  /*
   * Copy the generated invite link.
   */
  const handleCopyInvite = async () => {
    if (!inviteLink) return;

    try {
      setCopyingInvite(true);

      await navigator.clipboard.writeText(inviteLink);
    } catch (error) {
      console.error("Copy invite error:", error);
      setError("Unable to copy the invite link.");
    } finally {
      setCopyingInvite(false);
    }
  };

  if (loading) {
    return (
      <main>
        <p>Loading list...</p>
      </main>
    );
  }

  if (error && !list) {
    return (
      <main>
        <h1>Unable to load list</h1>
        <p>{error}</p>

        <Link to="/lists">
          Back to My Lists
        </Link>
      </main>
    );
  }

  if (!list) {
    return (
      <main>
        <h1>List not found</h1>

        <Link to="/lists">
          Back to My Lists
        </Link>
      </main>
    );
  }

  const isOwner = user?.id === list.created_by;

  return (
    <main>
      <Link to="/lists">
        ← Back to My Lists
      </Link>

      <h1>{list.name}</h1>

      {error && (
        <p>{error}</p>
      )}

      {/* Members */}
      <MembersList listId={list.id} />

      {/* Presence */}
      <section>
        <h2>Currently Viewing</h2>

        {onlineUsers.length === 0 ? (
          <p>No one is currently viewing this list.</p>
        ) : (
          <ul>
            {onlineUsers.map((onlineUser) => (
              <li key={onlineUser.userId}>
                🟢 {onlineUser.name}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Owner-only sharing */}
      {isOwner && (
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
                {copyingInvite ? "Copied" : "Copy Link"}
              </button>
            </div>
          )}
        </section>
      )}

      {/* Add item */}
      <section>
        <h2>Add Item</h2>

        <form onSubmit={handleAddItem}>
          <div>
            <label htmlFor="item-name">
              Item name
            </label>

            <input
              id="item-name"
              type="text"
              value={itemName}
              onChange={(event) =>
                setItemName(event.target.value)
              }
              placeholder="Milk"
            />
          </div>

          <div>
            <label htmlFor="item-quantity">
              Quantity
            </label>

            <input
              id="item-quantity"
              type="text"
              value={quantity}
              onChange={(event) =>
                setQuantity(event.target.value)
              }
              placeholder="2"
            />
          </div>

          <div>
            <label htmlFor="item-category">
              Category
            </label>

            <input
              id="item-category"
              type="text"
              value={category}
              onChange={(event) =>
                setCategory(event.target.value)
              }
              placeholder="Groceries"
            />
          </div>

          <button
            type="submit"
            disabled={addingItem}
          >
            {addingItem ? "Adding..." : "Add Item"}
          </button>
        </form>
      </section>

      {/* Items */}
      <section>
        <h2>Items</h2>

        {items.length === 0 ? (
          <p>No items yet.</p>
        ) : (
          <ul>
            {items.map((item) => (
              <li key={item.id}>
                <label>
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={(event) =>
                      handleToggleItem(
                        item.id,
                        event.target.checked
                      )
                    }
                  />

                  <span>
                    {item.name}
                  </span>
                </label>

                {item.quantity && (
                  <span>
                    {" "}
                    — {item.quantity}
                  </span>
                )}

                {item.category && (
                  <span>
                    {" "}
                    — {item.category}
                  </span>
                )}

                <button
                  type="button"
                  onClick={() =>
                    handleDeleteItem(item.id)
                  }
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
};

export default ListPage;