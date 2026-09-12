import ItemGroup from "./ItemGroup";
import CompletedItems from "./CompletedItems";

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

type ItemGroupData = {
  category: string;
  items: Item[];
};

const ItemList = ({
  items,
  loading,
  onToggleItem,
  onDeleteItem,
}: ItemListProps) => {
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

  /*
   * Separate active and completed items.
   */
  const activeItems = items.filter(
    (item) => !item.completed
  );

  const completedItems = items.filter(
    (item) => item.completed
  );

  /*
   * Group active items by category.
   */
  const groupedItems = activeItems.reduce<
    ItemGroupData[]
  >((groups, item) => {
    const category =
      item.category?.trim() ||
      "Uncategorized";

    const existingGroup = groups.find(
      (group) =>
        group.category === category
    );

    if (existingGroup) {
      existingGroup.items.push(item);
    } else {
      groups.push({
        category,
        items: [item],
      });
    }

    return groups;
  }, []);

  return (
    <section>
      <h2>Items</h2>

      {activeItems.length === 0 ? (
        <p>All items are completed.</p>
      ) : (
        groupedItems.map((group) => (
          <ItemGroup
            key={group.category}
            category={group.category}
            items={group.items}
            onToggleItem={onToggleItem}
            onDeleteItem={onDeleteItem}
          />
        ))
      )}

      <CompletedItems
        items={completedItems}
        onToggleItem={onToggleItem}
        onDeleteItem={onDeleteItem}
      />
    </section>
  );
};

export default ItemList;