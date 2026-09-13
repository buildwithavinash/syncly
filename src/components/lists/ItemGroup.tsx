import { useState } from "react";
import { Trash2 } from "lucide-react";
import ConfirmModal from "../common/ConfirmModal";
import type { Item } from "../../services/itemService";

type ItemGroupProps = {
  category: string;
  items: Item[];
  onToggleItem: (itemId: string, completed: boolean) => Promise<void>;
  onDeleteItem: (itemId: string) => Promise<void>;
};

const ItemGroup = ({
  category,
  items,
  onToggleItem,
  onDeleteItem,
}: ItemGroupProps) => {
  const [pendingDelete, setPendingDelete] = useState<Item | null>(null);
  const [deleting, setDeleting] = useState(false);

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
    <div className="py-2">
      <h3 className="mb-1.5 text-xs font-medium uppercase tracking-wide text-slate">
        {category}
      </h3>

      <div className="flex flex-col divide-y divide-border rounded-lg border border-border">
        {items.map((item) => (
          <div
            key={item.id}
            className="group flex items-center gap-2.5 px-3 py-2"
          >
            <input
              type="checkbox"
              checked={item.completed}
              onChange={(event) =>
                onToggleItem(item.id, event.target.checked)
              }
              className="h-4 w-4 shrink-0 rounded border-border-strong accent-accent"
            />

            <span
              className={`flex-1 truncate text-sm ${
                item.completed ? "text-slate line-through" : "text-ink"
              }`}
            >
              {item.name}
              {item.quantity && (
                <span className={item.completed ? "" : "text-slate"}>
                  {" "}
                  — {item.quantity}
                </span>
              )}
            </span>

            <button
              type="button"
              onClick={() => setPendingDelete(item)}
              className="shrink-0 rounded-md p-1 text-slate opacity-0 transition-colors hover:text-danger group-hover:opacity-100 focus-visible:opacity-100"
              aria-label={`Delete ${item.name}`}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>

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

export default ItemGroup;