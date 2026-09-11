import { useState, type SubmitEvent } from "react";
import { useNavigate } from "react-router";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

const CreateListPage = () => {
  const [listName, setListName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");

    const trimmedName = listName.trim();

    if (!trimmedName) {
      setError("Please enter a valid list name.");
      return;
    }

    if (!user) {
      setError("You must be logged in to create a list.");
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("lists")
        .insert({
          name: trimmedName,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error("Create list error:", error);
        setError(error.message);
        return;
      }

      console.log("List created:", data);

      navigate(`/lists/${data.id}`);
    } catch (error) {
      console.error("Unexpected error:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
      <h1>Create a new list</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="listName">List name</label>

          <input
            id="listName"
            type="text"
            value={listName}
            onChange={(e) => setListName(e.target.value)}
            placeholder="Enter list name"
          />
        </div>

        {error && <p>{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create List"}
        </button>
      </form>
    </main>
  );
};

export default CreateListPage;