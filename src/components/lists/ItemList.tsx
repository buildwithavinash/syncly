import { useState } from "react";

import type { Item } from "../../services/itemService";

type ItemListProps = {
  items: Item[];
  loading: boolean;
  onToggleItem: (
    itemId: string,
    completed: boolean
  ) => Promise<void>;
  onDeleteItem: (
    itemId: string
  ) => Promise<void>;
};

const ItemList = ({
  items,
  loading,
  onToggleItem,
  onDeleteItem,
}: ItemListProps) => {
  const [completedOpen, setCompletedOpen] =
    useState(false);

  if (loading) {
    return (
      <section>
        <h2>Items</h2>
        <p>Loading items...</p>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section>
        <h2>Items</h2>
        <p>No items yet.</p>
      </section>
    );
  }

  const activeItems = items.filter(
    (item) => !item.completed
  );

  const completedItems = items.filter(
    (item) => item.completed
  );

  return (
    <section>
      <h2>Items</h2>

      {activeItems.length > 0 && (
        <ul>
          {activeItems.map((item) => (
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

              {item.category && (
                <span>
                  {" "}
                  — {item.category}
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

      {completedItems.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() =>
              setCompletedOpen(
                (current) => !current
              )
            }
          >
            Completed ({completedItems.length})
            {completedOpen ? " ▲" : " ▼"}
          </button>

          {completedOpen && (
            <ul>
              {completedItems.map((item) => (
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

                  {item.category && (
                    <span>
                      {" "}
                      — {item.category}
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
      )}
    </section>
  );
};

export default ItemList;