import ItemGroup from "./ItemGroup";
import CompletedItems from "./CompletedItems";
import type { Item } from "../../services/itemService";

type ItemListProps = {
  items: Item[];
  loading: boolean;
  onToggleItem: (itemId: string, completed: boolean) => Promise<void>;
  onDeleteItem: (itemId: string) => Promise<void>;
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
      <section className="py-5">
        <h2 className="mb-3 text-sm font-medium text-ink">Items</h2>
        <p className="text-sm text-slate">Loading items...</p>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="py-5">
        <h2 className="mb-3 text-sm font-medium text-ink">Items</h2>
        <p className="text-sm text-slate">No items yet.</p>
      </section>
    );
  }

  const activeItems = items.filter((item) => !item.completed);
  const completedItems = items.filter((item) => item.completed);

  const groupedItems = activeItems.reduce<ItemGroupData[]>((groups, item) => {
    const category = item.category?.trim() || "Uncategorized";
    const existingGroup = groups.find((group) => group.category === category);

    if (existingGroup) {
      existingGroup.items.push(item);
    } else {
      groups.push({ category, items: [item] });
    }

    return groups;
  }, []);

  return (
    <section className="py-5">
      <h2 className="mb-1 text-sm font-medium text-ink">Items</h2>

      {activeItems.length === 0 ? (
        <p className="py-3 text-sm text-slate">All items are completed.</p>
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