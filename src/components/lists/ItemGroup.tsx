import { useState } from "react";
import {
  Pencil,
  Trash2,
} from "lucide-react";

import ConfirmModal from "../common/ConfirmModal";
import Modal from "../common/Modal";

import { formatDisplayText } from "../../lib/formatters";
import type { Item } from "../../services/itemService";
import { useToast } from "../../context/ToastContext";

type ItemGroupProps = {
  category: string;
  items: Item[];

  onToggleItem: (
    itemId: string,
    completed: boolean
  ) => Promise<void>;

  onEditItem: (
    itemId: string,
    name: string,
    quantity: string,
    category: string
  ) => Promise<boolean>;

  onDeleteItem: (
    itemId: string
  ) => Promise<void>;
};

const ItemGroup = ({
  category,
  items,
  onToggleItem,
  onEditItem,
  onDeleteItem,
}: ItemGroupProps) => {
  const { showToast } = useToast();

  const [pendingDelete, setPendingDelete] =
    useState<Item | null>(null);

  const [pendingEdit, setPendingEdit] =
    useState<Item | null>(null);

  const [editName, setEditName] =
    useState("");

  const [editQuantity, setEditQuantity] =
    useState("");

  const [editCategory, setEditCategory] =
    useState("");

  const [deleting, setDeleting] =
    useState(false);

  const [editing, setEditing] =
    useState(false);

  const handleOpenEdit = (item: Item) => {
    setPendingEdit(item);

    setEditName(item.name);
    setEditQuantity(item.quantity ?? "");
    setEditCategory(item.category ?? "");
  };

  const handleCloseEdit = () => {
    if (editing) return;

    setPendingEdit(null);
    setEditName("");
    setEditQuantity("");
    setEditCategory("");
  };

  const handleConfirmEdit = async () => {
    if (!pendingEdit) return;

    const trimmedName =
      editName.trim();

    if (!trimmedName) return;

    try {
      setEditing(true);

      const success =
        await onEditItem(
          pendingEdit.id,
          trimmedName,
          editQuantity,
          editCategory
        );

      if (!success) {
        showToast(
          "Couldn't save item changes",
          "error"
        );
        return;
      }

      handleCloseEdit();

      showToast("Item updated");
    } finally {
      setEditing(false);
    }
  };

  const handleConfirmDelete =
    async () => {
      if (!pendingDelete) return;

      try {
        setDeleting(true);

        await onDeleteItem(
          pendingDelete.id
        );

        setPendingDelete(null);
      } finally {
        setDeleting(false);
      }
    };

  return (
    <div className="py-2">
      <h3 className="mb-1.5 text-xs font-medium uppercase tracking-wide text-slate">
        {formatDisplayText(category)}
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
                onToggleItem(
                  item.id,
                  event.target.checked
                )
              }
              className="h-4 w-4 shrink-0 rounded border-border-strong accent-accent"
            />

            <span
              className={`flex-1 truncate text-sm ${
                item.completed
                  ? "text-slate line-through"
                  : "text-ink"
              }`}
            >
              {formatDisplayText(item.name)}

              {item.quantity && (
                <span
                  className={
                    item.completed
                      ? ""
                      : "text-slate"
                  }
                >
                  {" "}
                  — {item.quantity}
                </span>
              )}
            </span>

            <button
              type="button"
              onClick={() =>
                handleOpenEdit(item)
              }
              className="shrink-0 rounded-md p-1 text-slate opacity-0 transition-colors hover:text-ink group-hover:opacity-100 focus-visible:opacity-100"
              aria-label={`Edit ${formatDisplayText(
                item.name
              )}`}
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>

            <button
              type="button"
              onClick={() =>
                setPendingDelete(item)
              }
              className="shrink-0 rounded-md p-1 text-slate opacity-0 transition-colors hover:text-danger group-hover:opacity-100 focus-visible:opacity-100"
              aria-label={`Delete ${formatDisplayText(
                item.name
              )}`}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>

      <Modal
        isOpen={pendingEdit !== null}
        onClose={handleCloseEdit}
        title="Edit item"
      >
        <div className="flex flex-col gap-3">
          <div>
            <label
              htmlFor="edit-item-name"
              className="mb-1.5 block text-sm text-ink"
            >
              Item name
            </label>

            <input
              id="edit-item-name"
              type="text"
              value={editName}
              onChange={(event) =>
                setEditName(
                  event.target.value
                )
              }
              placeholder="Milk"
              autoFocus
              disabled={editing}
              className="w-full rounded-md border border-border bg-bg px-3 py-2.5 text-sm text-ink placeholder:text-slate/70 transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>

          <div className="flex gap-3">
            <div className="w-24">
              <label
                htmlFor="edit-item-quantity"
                className="mb-1.5 block text-sm text-ink"
              >
                Qty
              </label>

              <input
                id="edit-item-quantity"
                type="text"
                value={editQuantity}
                onChange={(event) =>
                  setEditQuantity(
                    event.target.value
                  )
                }
                placeholder="2"
                disabled={editing}
                className="w-full rounded-md border border-border bg-bg px-3 py-2.5 text-sm text-ink placeholder:text-slate/70 transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
            </div>

            <div className="flex-1">
              <label
                htmlFor="edit-item-category"
                className="mb-1.5 block text-sm text-ink"
              >
                Category
              </label>

              <input
                id="edit-item-category"
                type="text"
                value={editCategory}
                onChange={(event) =>
                  setEditCategory(
                    event.target.value
                  )
                }
                placeholder="Groceries"
                disabled={editing}
                className="w-full rounded-md border border-border bg-bg px-3 py-2.5 text-sm text-ink placeholder:text-slate/70 transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
            </div>
          </div>

          <div className="mt-1 flex gap-2">
            <button
              type="button"
              onClick={handleCloseEdit}
              disabled={editing}
              className="flex-1 rounded-md border border-border py-2.5 text-sm text-ink transition-colors hover:border-border-strong disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleConfirmEdit}
              disabled={
                editing ||
                !editName.trim()
              }
              className="flex-1 rounded-md bg-accent py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {editing
                ? "Saving..."
                : "Save changes"}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={
          pendingDelete !== null
        }
        onClose={() =>
          setPendingDelete(null)
        }
        onConfirm={
          handleConfirmDelete
        }
        title="Delete this item?"
        description={
          pendingDelete
            ? `"${formatDisplayText(
                pendingDelete.name
              )}" will be removed from the list.`
            : ""
        }
        confirming={deleting}
      />
    </div>
  );
};

export default ItemGroup;