import { useState } from "react";
import { Link, useParams } from "react-router";

import { useAuth } from "../context/AuthContext";
import { usePresence } from "../hooks/usePresence";
import { useList } from "../hooks/useList";
import { useListItems } from "../hooks/useListItems";

import { createListInvite } from "../services/listService";

import MembersList from "../components/lists/MembersList";

const ListPage = () => {
  const { id } = useParams();
  const { user } = useAuth();

  /*
   * List data.
   */
  const {
    list,
    loading: listLoading,
    error: listError,
  } = useList(id);

  /*
   * Item data and actions.
   */
  const {
    items,
    loading: itemsLoading,
    error: itemsError,
    addingItem,
    addItem,
    toggleItem,
    deleteItemById,
  } = useListItems(id, user?.id);

  /*
   * Invite state.
   */
  const [inviteLink, setInviteLink] = useState("");
  const [creatingInvite, setCreatingInvite] =
    useState(false);
  const [copyingInvite, setCopyingInvite] =
    useState(false);

  /*
   * Presence.
   */
  const userName =
    user?.user_metadata?.name ?? "Syncly User";

  const { onlineUsers } = usePresence(
    id ?? "",
    user?.id ?? "",
    userName
  );

  /*
   * Create an invite link.
   */
  const handleCreateInvite = async () => {
    if (!id) return;

    try {
      setCreatingInvite(true);

      const link = await createListInvite(id);

      setInviteLink(link);
    } catch (error) {
      console.error(
        "Error creating invite:",
        error
      );
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

      await navigator.clipboard.writeText(
        inviteLink
      );
    } catch (error) {
      console.error(
        "Error copying invite:",
        error
      );
    } finally {
      setCopyingInvite(false);
    }
  };

  /*
   * Loading state.
   */
  if (listLoading) {
    return (
      <main>
        <p>Loading list...</p>
      </main>
    );
  }

  /*
   * List loading error.
   */
  if (listError && !list) {
    return (
      <main>
        <h1>Unable to load list</h1>
        <p>{listError}</p>

        <Link to="/lists">
          Back to My Lists
        </Link>
      </main>
    );
  }

  /*
   * List does not exist.
   */
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

  const isOwner =
    user?.id === list.created_by;

  /*
   * Combine item errors for now.
   *
   * We'll eventually move all page-level error
   * handling into a reusable component.
   */
  const itemError = itemsError;

  return (
    <main>
      <Link to="/lists">
        ← Back to My Lists
      </Link>

      <h1>{list.name}</h1>

      {itemError && (
        <p>{itemError}</p>
      )}

      {/* Members */}
      <MembersList listId={list.id} />

      {/* Presence */}
      <section>
        <h2>Currently Viewing</h2>

        {onlineUsers.length === 0 ? (
          <p>
            No one is currently viewing this
            list.
          </p>
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
                {copyingInvite
                  ? "Copied"
                  : "Copy Link"}
              </button>
            </div>
          )}
        </section>
      )}

      {/* Add item */}
      <section>
        <h2>Add Item</h2>

        <form
          onSubmit={(event) => {
            const form = event.currentTarget;

            const formData = new FormData(form);

            const name =
              String(
                formData.get("item-name") ?? ""
              );

            const quantity =
              String(
                formData.get("item-quantity") ?? ""
              );

            const category =
              String(
                formData.get("item-category") ?? ""
              );

            addItem(
              event,
              name,
              quantity,
              category
            );

            /*
             * Reset the form immediately because
             * the optimistic item has already been
             * added to the UI.
             */
            form.reset();
          }}
        >
          <div>
            <label htmlFor="item-name">
              Item name
            </label>

            <input
              id="item-name"
              name="item-name"
              type="text"
              placeholder="Milk"
            />
          </div>

          <div>
            <label htmlFor="item-quantity">
              Quantity
            </label>

            <input
              id="item-quantity"
              name="item-quantity"
              type="text"
              placeholder="2"
            />
          </div>

          <div>
            <label htmlFor="item-category">
              Category
            </label>

            <input
              id="item-category"
              name="item-category"
              type="text"
              placeholder="Groceries"
            />
          </div>

          <button
            type="submit"
            disabled={addingItem}
          >
            {addingItem
              ? "Adding..."
              : "Add Item"}
          </button>
        </form>
      </section>

      {/* Items */}
      <section>
        <h2>Items</h2>

        {itemsLoading ? (
          <p>Loading items...</p>
        ) : items.length === 0 ? (
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
                      toggleItem(
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
                    deleteItemById(item.id)
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