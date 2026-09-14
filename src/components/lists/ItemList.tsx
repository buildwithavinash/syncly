import { useState } from "react";
import { Plus } from "lucide-react";

import ItemGroup from "./ItemGroup";
import Loader from "../common/Loader";

import type { Item } from "../../services/itemService";

type ItemListProps = {
  items: Item[];
  loading: boolean;

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

  onAddItemClick: () => void;
};

type ItemGroupData = {
  category: string;
  items: Item[];
};

type Tab =
  | "all"
  | "pending"
  | "completed";

const groupByCategory = (
  items: Item[]
): ItemGroupData[] => {
  return items.reduce<ItemGroupData[]>(
    (groups, item) => {
      const category =
        item.category?.trim() ||
        "Uncategorized";

      const existingGroup =
        groups.find(
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
    },
    []
  );
};

const ItemList = ({
  items,
  loading,
  onToggleItem,
  onEditItem,
  onDeleteItem,
  onAddItemClick,
}: ItemListProps) => {
  const [activeTab, setActiveTab] =
    useState<Tab>("all");

  const pendingItems = items.filter(
    (item) => !item.completed
  );

  const completedItems = items.filter(
    (item) => item.completed
  );

  const tabItems =
    activeTab === "pending"
      ? pendingItems
      : activeTab === "completed"
      ? completedItems
      : items;

  const groupedItems =
    groupByCategory(tabItems);

  const tabs: {
    id: Tab;
    label: string;
  }[] = [
    {
      id: "all",
      label: `All (${items.length})`,
    },
    {
      id: "pending",
      label: `Pending (${pendingItems.length})`,
    },
    {
      id: "completed",
      label: `Completed (${completedItems.length})`,
    },
  ];

  return (
    <section className="py-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-sm font-medium text-ink">
          Items
        </h2>

        <button
          type="button"
          onClick={onAddItemClick}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90"
        >
          <Plus className="h-3.5 w-3.5" />
          Add item
        </button>
      </div>

      {loading ? (
        <Loader label="Loading items..." />
      ) : (
        <>
          <div className="mb-3 inline-flex rounded-full border border-border bg-surface p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() =>
                  setActiveTab(tab.id)
                }
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-accent text-white"
                    : "text-slate hover:text-ink"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {items.length === 0 ? (
            <p className="text-sm text-slate">
              No items yet.
            </p>
          ) : groupedItems.length === 0 ? (
            <p className="py-3 text-sm text-slate">
              {activeTab === "pending"
                ? "Nothing pending."
                : "Nothing completed yet."}
            </p>
          ) : (
            groupedItems.map((group) => (
              <ItemGroup
                key={group.category}
                category={group.category}
                items={group.items}
                onToggleItem={
                  onToggleItem
                }
                onEditItem={
                  onEditItem
                }
                onDeleteItem={
                  onDeleteItem
                }
              />
            ))
          )}
        </>
      )}
    </section>
  );
};

export default ItemList;