import type { Item } from "../../services/itemService";

type ItemGroupProps = {
  category: string;
  items: Item[];
  onToggleItem: (
    itemId: string,
    completed: boolean
  ) => Promise<void>;
  onDeleteItem: (
    itemId: string
  ) => Promise<void>;
};

const ItemGroup = ({
  category,
  items,
  onToggleItem,
  onDeleteItem,
}: ItemGroupProps) => {
  return (
    <div>
      <h3>{category}</h3>

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
    </div>
  );
};

export default ItemGroup;