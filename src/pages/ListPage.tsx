import { useEffect, useState, type SubmitEvent } from "react";
import { useParams } from "react-router";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
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

  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [category, setCategory] = useState("");

  const [inviteLink, setInviteLink] = useState("");
  const [creatingInvite, setCreatingInvite] = useState(false);
  const [copied, setCopied] = useState(false);

  const [loading, setLoading] = useState(true);
  const [addingItem, setAddingItem] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchListAndItems = async () => {
      if (!id) {
        setError("List ID is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const { data: listData, error: listError } = await supabase
          .from("lists")
          .select("*")
          .eq("id", id)
          .single();

        if (listError) {
          console.error("Fetch list error:", listError);
          setError(listError.message);
          return;
        }

        setList(listData);

        const { data: itemsData, error: itemsError } = await supabase
          .from("items")
          .select("*")
          .eq("list_id", id)
          .order("created_at", { ascending: true });

        if (itemsError) {
          console.error("Fetch items error:", itemsError);
          setError(itemsError.message);
          return;
        }

        setItems(itemsData ?? []);
      } catch (error) {
        console.error("Unexpected error:", error);
        setError("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchListAndItems();
  }, [id]);

  useEffect(() => {
    if (!id) {
      return;
    }

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
              (item) => item.id === newItem.id,
            );

            if (alreadyExists) {
              return currentItems;
            }

            return [...currentItems, newItem];
          });
        },
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
              item.id === updatedItem.id ? updatedItem : item,
            ),
          );
        },
      )
      .on(
  "postgres_changes",
  {
    event: "DELETE",
    schema: "public",
    table: "items",
  },
  (payload) => {
    console.log("Realtime DELETE:", payload);

    const deletedItem = payload.old as { id: string };

    setItems((currentItems) =>
      currentItems.filter((item) => item.id !== deletedItem.id)
    );
  }
).subscribe((status) => {
        console.log("Realtime status:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  const handleAddItem = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");

    const trimmedName = itemName.trim();
    const trimmedQuantity = quantity.trim();
    const trimmedCategory = category.trim();

    if (!trimmedName) {
      setError("Please enter an item name.");
      return;
    }

    if (!id) {
      setError("List ID is missing.");
      return;
    }

    if (!user) {
      setError("You must be logged in to add an item.");
      return;
    }

    try {
      setAddingItem(true);

      const { data, error } = await supabase
        .from("items")
        .insert({
          list_id: id,
          name: trimmedName,
          quantity: trimmedQuantity || null,
          category: trimmedCategory || null,
          completed: false,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error("Add item error:", error);
        setError(error.message);
        return;
      }

      setItems((currentItems) => {
        const alreadyExists = currentItems.some((item) => item.id === data.id);

        if (alreadyExists) {
          return currentItems;
        }

        return [...currentItems, data];
      });

      setItemName("");
      setQuantity("");
      setCategory("");
    } catch (error) {
      console.error("Unexpected error:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setAddingItem(false);
    }
  };

  const handleToggleItem = async (item: Item) => {
    setError("");

    const newCompletedValue = !item.completed;

    const { data, error } = await supabase
      .from("items")
      .update({
        completed: newCompletedValue,
      })
      .eq("id", item.id)
      .select()
      .single();

    if (error) {
      console.error("Toggle item error:", error);
      setError(error.message);
      return;
    }

    setItems((currentItems) =>
      currentItems.map((currentItem) =>
        currentItem.id === item.id ? data : currentItem,
      ),
    );
  };

  const handleDeleteItem = async (itemId: string) => {
    setError("");

    const { error } = await supabase.from("items").delete().eq("id", itemId);

    if (error) {
      console.error("Delete item error:", error);
      setError(error.message);
      return;
    }

    setItems((currentItems) =>
      currentItems.filter((item) => item.id !== itemId),
    );
  };

  const handleCreateInvite = async () => {
    if (!id) {
      setError("List ID is missing.");
      return;
    }

    setError("");
    setCopied(false);

    try {
      setCreatingInvite(true);

      const { data: token, error } = await supabase.rpc("create_list_invite", {
        p_list_id: id,
        p_expires_at: null,
      });

      if (error) {
        console.error("Create invite error:", error);
        setError(error.message);
        return;
      }

      const link = `${window.location.origin}/invite/${token}`;

      setInviteLink(link);
    } catch (error) {
      console.error("Unexpected error:", error);
      setError("Something went wrong while creating the invite.");
    } finally {
      setCreatingInvite(false);
    }
  };

  const handleCopyInvite = async () => {
    if (!inviteLink) {
      return;
    }

    try {
      await navigator.clipboard.writeText(inviteLink);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Copy invite error:", error);
      setError("Unable to copy the invite link.");
    }
  };

  if (loading) {
    return <p>Loading list...</p>;
  }

  if (error && !list) {
    return (
      <main>
        <h1>Unable to load list</h1>
        <p>{error}</p>
      </main>
    );
  }

  if (!list) {
    return (
      <main>
        <h1>List not found</h1>
      </main>
    );
  }

  const isOwner = user?.id === list.created_by;

  return (
    <main>
      <h1>{list.name}</h1>

<MembersList listId={list.id} />
      <p>List ID: {list.id}</p>

      {isOwner && (
        <section>
          <h2>Share List</h2>

          <button
            type="button"
            onClick={handleCreateInvite}
            disabled={creatingInvite}
          >
            {creatingInvite ? "Creating invite..." : "Generate Invite Link"}
          </button>

          {inviteLink && (
            <div>
              <p>Invite link:</p>

              <input type="text" value={inviteLink} readOnly />

              <button type="button" onClick={handleCopyInvite}>
                {copied ? "Copied!" : "Copy Link"}
              </button>
            </div>
          )}
        </section>
      )}

      <section>
        <h2>Add Item</h2>

        <form onSubmit={handleAddItem}>
          <div>
            <label htmlFor="itemName">Item name</label>

            <input
              id="itemName"
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="Milk"
            />
          </div>

          <div>
            <label htmlFor="quantity">Quantity</label>

            <input
              id="quantity"
              type="text"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="2 litres"
            />
          </div>

          <div>
            <label htmlFor="category">Category</label>

            <input
              id="category"
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Groceries"
            />
          </div>

          {error && <p>{error}</p>}

          <button type="submit" disabled={addingItem}>
            {addingItem ? "Adding..." : "Add Item"}
          </button>
        </form>
      </section>

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
                    onChange={() => handleToggleItem(item)}
                  />

                  <strong>{item.name}</strong>

                  {item.quantity && <span> — {item.quantity}</span>}

                  {item.category && <span> — {item.category}</span>}
                </label>

                <button type="button" onClick={() => handleDeleteItem(item.id)}>
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
