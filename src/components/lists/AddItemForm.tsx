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
    <section className="py-5">
      <h2 className="mb-3 text-sm font-medium text-ink">Add item</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3" noValidate>
        <input
          type="text"
          value={itemName}
          onChange={(event) => setItemName(event.target.value)}
          placeholder="Milk"
          className="w-full rounded-md border border-border bg-bg px-3 py-2.5 text-sm text-ink placeholder:text-slate/70 transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
        />

        <div className="flex gap-3">
          <input
            type="text"
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
            placeholder="Qty"
            className="w-24 rounded-md border border-border bg-bg px-3 py-2.5 text-sm text-ink placeholder:text-slate/70 transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
          />

          <input
            type="text"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            placeholder="Category"
            className="flex-1 rounded-md border border-border bg-bg px-3 py-2.5 text-sm text-ink placeholder:text-slate/70 transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
        </div>

        <button
          type="submit"
          disabled={addingItem}
          className="inline-flex items-center justify-center gap-1.5 rounded-md bg-accent py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          <Plus className="h-4 w-4" />
          {addingItem ? "Adding..." : "Add item"}
        </button>
      </form>
    </section>
  );
};

export default AddItemForm;