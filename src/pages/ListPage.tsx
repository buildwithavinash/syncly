import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { supabase } from "../lib/supabase";


// Define what a list looks like
type List = {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
  updated_at: string;
};

const ListPage = () => {
  const { id } = useParams();

  const [list, setList] = useState<List | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchList = async () => {
      if (!id) {
        setError("List ID is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const { data, error } = await supabase
          .from("lists")
          .select("*")
          .eq("id", id)
          .single();

        if (error) {
          console.error("Fetch list error:", error);
          setError(error.message);
          return;
        }

        setList(data);
      } catch (error) {
        console.error("Unexpected error:", error);
        setError("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchList();
  }, [id]);

  if (loading) {
    return <p>Loading list...</p>;
  }

  if (error) {
    return (
      <main>
        <h1>Unable to load list</h1>
        <p>{error}</p>
      </main>
    );
  }

  if (!list) {
    return (
      <main>
        <h1>List not found</h1>
      </main>
    );
  }

  return (
    <main>
      <h1>{list.name}</h1>

      <p>List ID: {list.id}</p>

      <section>
        <h2>Items</h2>

        <p>No items yet.</p>
      </section>
    </main>
  );
};

export default ListPage;