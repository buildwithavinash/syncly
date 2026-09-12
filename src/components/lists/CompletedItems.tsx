import { useState } from "react";
import { ChevronDown, Trash2 } from "lucide-react";
import ConfirmModal from "../common/ConfirmModal";
import type { Item } from "../../services/itemService";

type CompletedItemsProps = {
  items: Item[];
  onToggleItem: (itemId: string, completed: boolean) => Promise<void>;
  onDeleteItem: (itemId: string) => Promise<void>;
};

const CompletedItems = ({
  items,
  onToggleItem,
  onDeleteItem,
}: CompletedItemsProps) => {
  const [open, setOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Item | null>(null);
  const [deleting, setDeleting] = useState(false);

  if (items.length === 0) {
    return null;
  }

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;

    try {
      setDeleting(true);
      await onDeleteItem(pendingDelete.id);
      setPendingDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="py-3">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex items-center gap-1.5 text-sm text-slate transition-colors hover:text-ink"
      >
        Completed ({items.length})
        <ChevronDown
          className={`h-4 w-4 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="mt-2 flex flex-col divide-y divide-border rounded-lg border border-border">
          {items.map((item) => (
            <div
              key={item.id}
              className="group flex items-center gap-3 px-4 py-3"
            >
              <input
                type="checkbox"
                checked={item.completed}
                onChange={(event) =>
                  onToggleItem(item.id, event.target.checked)
                }
                className="h-4 w-4 shrink-0 rounded border-border-strong accent-accent"
              />

              <span className="flex-1 text-sm text-slate line-through">
                {item.name}
                {item.quantity && <span> — {item.quantity}</span>}
              </span>

              <button
                type="button"
                onClick={() => setPendingDelete(item)}
                className="shrink-0 rounded-md p-1.5 text-slate opacity-0 transition-colors hover:text-danger group-hover:opacity-100 focus-visible:opacity-100"
                aria-label={`Delete ${item.name}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete this item?"
        description={
          pendingDelete
            ? `"${pendingDelete.name}" will be removed from the list.`
            : ""
        }
        confirming={deleting}
      />
    </div>
  );
};

export default CompletedItems;