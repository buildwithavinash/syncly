import { useState } from "react";
import { Link, useParams } from "react-router";

import { useAuth } from "../context/AuthContext";
import { usePresence } from "../hooks/usePresence";
import { useList } from "../hooks/useList";
import { useListItems } from "../hooks/useListItems";

import MembersList from "../components/lists/MembersList";
import AddItemForm from "../components/lists/AddItemForm";
import ItemList from "../components/lists/ItemList";
import PresenceList from "../components/lists/PresenceList";
import ShareList from "../components/lists/ShareList";
import ListHeader from "../components/lists/ListHeader";
import { useActivityLog } from "../hooks/useActivityLog";
import ActivityLog from "../components/lists/ActivityLog";

const ListPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [shareError, setShareError] =
  useState("");
  const {
  activities,
  loading: activityLoading,
  error: activityError,
} = useActivityLog(id);

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
     <ListHeader listName={list.name} />

      {shareError && (
  <p>{shareError}</p>
)}


      {itemError && (
        <p>{itemError}</p>
      )}

      {/* Members */}
      <MembersList listId={list.id} />

      {/* Presence */}
      <PresenceList onlineUsers={onlineUsers} />

      {/* Owner-only sharing */}
      {isOwner && (
         <ShareList
    listId={list.id}
    onError={setShareError}
  />
      )}

      {/* Add item */}
      <AddItemForm
  addingItem={addingItem}
  onAddItem={addItem}
/>

      {/* Items */}
      <ItemList
  items={items}
  loading={itemsLoading}
  onToggleItem={toggleItem}
  onDeleteItem={deleteItemById}
/>

<ActivityLog
  activities={activities}
  loading={activityLoading}
  error={activityError}
/>
    </main>
  );
};

export default ListPage;