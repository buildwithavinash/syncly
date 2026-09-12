import { useState, type SubmitEvent } from "react";

type AddItemFormProps = {
  addingItem: boolean;
  onAddItem: (
    event: SubmitEvent<HTMLFormElement>,
    name: string,
    quantity: string,
    category: string
  ) => Promise<void>;
};

const AddItemForm = ({
  addingItem,
  onAddItem,
}: AddItemFormProps) => {
  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [category, setCategory] = useState("");

  const handleSubmit = async (
    event: SubmitEvent<HTMLFormElement>
  ) => {
    await onAddItem(
      event,
      itemName,
      quantity,
      category
    );

    /*
     * Clear the form after submitting.
     *
     * The item itself is handled optimistically
     * by useListItems.
     */
    setItemName("");
    setQuantity("");
    setCategory("");
  };

  return (
    <section>
      <h2>Add Item</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="item-name">
            Item name
          </label>

          <input
            id="item-name"
            type="text"
            value={itemName}
            onChange={(event) =>
              setItemName(event.target.value)
            }
            placeholder="Milk"
          />
        </div>

        <div>
          <label htmlFor="item-quantity">
            Quantity
          </label>

          <input
            id="item-quantity"
            type="text"
            value={quantity}
            onChange={(event) =>
              setQuantity(event.target.value)
            }
            placeholder="2"
          />
        </div>

        <div>
          <label htmlFor="item-category">
            Category
          </label>

          <input
            id="item-category"
            type="text"
            value={category}
            onChange={(event) =>
              setCategory(event.target.value)
            }
            placeholder="Groceries"
          />
        </div>

        <button
          type="submit"
          disabled={addingItem}
        >
          {addingItem
            ? "Adding..."
            : "Add Item"}
        </button>
      </form>
    </section>
  );
};

export default AddItemForm;