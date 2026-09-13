import { useState, type SubmitEvent } from "react";
import { Plus } from "lucide-react";

type AddItemFormProps = {
  addingItem: boolean;
  onAddItem: (
    event: SubmitEvent<HTMLFormElement>,
    name: string,
    quantity: string,
    category: string
  ) => Promise<void>;
};

const AddItemForm = ({ addingItem, onAddItem }: AddItemFormProps) => {
  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [category, setCategory] = useState("");

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    await onAddItem(event, itemName, quantity, category);

    setItemName("");
    setQuantity("");
    setCategory("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3" noValidate>
      <div>
        <label htmlFor="item-name" className="mb-1.5 block text-sm text-ink">
          Item name
        </label>
        <input
          id="item-name"
          type="text"
          value={itemName}
          onChange={(event) => setItemName(event.target.value)}
          placeholder="Milk"
          autoFocus
          className="w-full rounded-md border border-border bg-bg px-3 py-2.5 text-sm text-ink placeholder:text-slate/70 transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
        />
      </div>

      <div className="flex gap-3">
        <div className="w-24">
          <label
            htmlFor="item-quantity"
            className="mb-1.5 block text-sm text-ink"
          >
            Qty
          </label>
          <input
            id="item-quantity"
            type="text"
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
            placeholder="2"
            className="w-full rounded-md border border-border bg-bg px-3 py-2.5 text-sm text-ink placeholder:text-slate/70 transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
        </div>

        <div className="flex-1">
          <label
            htmlFor="item-category"
            className="mb-1.5 block text-sm text-ink"
          >
            Category
          </label>
          <input
            id="item-category"
            type="text"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            placeholder="Groceries"
            className="w-full rounded-md border border-border bg-bg px-3 py-2.5 text-sm text-ink placeholder:text-slate/70 transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={addingItem}
        className="mt-1 inline-flex items-center justify-center gap-1.5 rounded-md bg-accent py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        <Plus className="h-4 w-4" />
        {addingItem ? "Adding..." : "Add item"}
      </button>
    </form>
  );
};

export default AddItemForm;