import { useState } from "react";

import type { Item } from "../../services/itemService";

type CompletedItemsProps = {
  items: Item[];
  onToggleItem: (
    itemId: string,
    completed: boolean
  ) => Promise<void>;
  onDeleteItem: (
    itemId: string
  ) => Promise<void>;
};

const CompletedItems = ({
  items,
  onToggleItem,
  onDeleteItem,
}: CompletedItemsProps) => {
  const [open, setOpen] = useState(false);

  if (items.length === 0) {
    return null;
  }

  return (
    <div>
      <button
        type="button"
        onClick={() =>
          setOpen((current) => !current)
        }
      >
        Completed ({items.length})
        {open ? " ▲" : " ▼"}
      </button>

      {open && (
        <ul>
          {items.map((item) => (
            <li key={item.id}>
              <label>
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={(event) =>
                    onToggleItem(
                      item.id,
                      event.target.checked
                    )
                  }
                />

                <span>{item.name}</span>
              </label>

              {item.quantity && (
                <span>
                  {" "}
                  — {item.quantity}
                </span>
              )}

              <button
                type="button"
                onClick={() =>
                  onDeleteItem(item.id)
                }
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CompletedItems;