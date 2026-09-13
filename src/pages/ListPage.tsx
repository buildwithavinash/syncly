import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { usePresence } from "../hooks/usePresence";
import { useList } from "../hooks/useList";
import { useListItems } from "../hooks/useListItems";
import { useActivityLog } from "../hooks/useActivityLog";
import { useToast } from "../context/ToastContext";
import { supabase } from "../lib/supabase";

import Modal from "../components/common/Modal";
import Loader from "../components/common/Loader";
import ListHeader from "../components/lists/ListHeader";
import MembersList from "../components/lists/MembersList";
import AddItemForm from "../components/lists/AddItemForm";
import ItemList from "../components/lists/ItemList";
import ActivityLog from "../components/lists/ActivityLog";

const ListPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [membersOpen, setMembersOpen] = useState(false);
  const [addItemOpen, setAddItemOpen] = useState(false);
  const [activityOpen, setActivityOpen] = useState(false);
  const [creatorName, setCreatorName] = useState("");

  const {
    activities,
    loading: activityLoading,
    error: activityError,
  } = useActivityLog(id);

  const { list, loading: listLoading, error: listError } = useList(id);

  const {
    items,
    loading: itemsLoading,
    error: itemsError,
    addingItem,
    addItem,
    toggleItem,
    deleteItemById,
  } = useListItems(id, user?.id);

  const userName = user?.user_metadata?.name ?? "Cartify user";
  const { onlineUsers } = usePresence(id ?? "", user?.id ?? "", userName);
  const onlineUserIds = onlineUsers.map((onlineUser) => onlineUser.userId);

  useEffect(() => {
    if (!list?.created_by) {
      return;
    }

    const fetchCreatorName = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("name")
        .eq("id", list.created_by)
        .single();

      if (error) {
        console.error("Error fetching creator name:", error);
        return;
      }

      setCreatorName(data?.name ?? "Cartify user");
    };

    fetchCreatorName();
  }, [list?.created_by]);

  const handleAddItem: typeof addItem = async (event, name, quantity, category) => {
    await addItem(event, name, quantity, category);
    setAddItemOpen(false);
    showToast("Item added");
  };

  if (listLoading) {
    return (
      <main className="mx-auto max-w-container px-gutter py-10">
        <Loader label="Loading list..." centered />
      </main>
    );
  }

  if ((listError && !list) || !list) {
    return (
      <main className="relative min-h-screen px-gutter py-12">
        <Link
          to="/lists"
          aria-label="Back to my lists"
          className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-border text-ink transition-colors hover:border-border-strong hover:bg-surface sm:left-6 sm:top-6"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>

        <div className="mx-auto max-w-sm pt-14 text-center">
          <h1 className="font-display text-xl text-ink">
            {listError ? "Unable to load list" : "List not found"}
          </h1>
          {listError && <p className="mt-2 text-sm text-slate">{listError}</p>}

          <Link
            to="/lists"
            className="mt-5 inline-block rounded-md border border-border px-4 py-2 text-sm text-ink transition-colors hover:border-border-strong"
          >
            Back to my lists
          </Link>
        </div>
      </main>
    );
  }

  const isOwner = user?.id === list.created_by;

  return (
    <main className="mx-auto max-w-container px-gutter pb-24">
      <ListHeader
        listId={list.id}
        isOwner={isOwner}
        onlineCount={onlineUsers.length}
        onOpenMembers={() => setMembersOpen(true)}
        onOpenActivity={() => setActivityOpen(true)}
      />

      <div className="mx-auto max-w-2xl">
        <div className="pt-6">
          <h1 className="truncate font-display text-2xl text-ink sm:text-3xl">
            {list.name}
          </h1>
          <p className="mt-1 text-sm text-slate">
            Created by {isOwner ? "you" : creatorName || "..."}
          </p>
        </div>

        {itemsError && (
          <p className="mt-4 rounded-md bg-danger-tint px-3 py-2 text-sm text-danger">
            {itemsError}
          </p>
        )}



        <ItemList
          items={items}
          loading={itemsLoading}
          onToggleItem={toggleItem}
          onDeleteItem={deleteItemById}
          onAddItemClick={() => setAddItemOpen(true)}
        />
      </div>

      <Modal
        isOpen={membersOpen}
        onClose={() => setMembersOpen(false)}
        title="Members"
      >
        <MembersList listId={list.id} onlineUserIds={onlineUserIds} />
      </Modal>

      <Modal
        isOpen={addItemOpen}
        onClose={() => setAddItemOpen(false)}
        variant="sheet"
        title="Add item"
      >
        <AddItemForm addingItem={addingItem} onAddItem={handleAddItem} />
      </Modal>

      <Modal
        isOpen={activityOpen}
        onClose={() => setActivityOpen(false)}
        title="Activity"
      >
        <ActivityLog
          activities={activities}
          loading={activityLoading}
          error={activityError}
        />
      </Modal>
    </main>
  );
};

export default ListPage;