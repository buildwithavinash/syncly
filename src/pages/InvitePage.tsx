import { Link, useNavigate, useParams } from "react-router";

import { useAuth } from "../context/AuthContext";
import { usePublicList } from "../hooks/usePublicList";
import { useAcceptInvite } from "../hooks/useAcceptInvite";

const InvitePage = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const { user } = useAuth();

  const {
    data,
    loading,
    error,
  } = usePublicList(token);

  const {
    accepting,
    error: acceptError,
    acceptInvite,
  } = useAcceptInvite();

  if (loading) {
    return <p>Loading shared list...</p>;
  }

  if (error) {
    return (
      <main>
        <h1>Unable to open list</h1>
        <p>{error}</p>

        <Link to="/">
          Go to Syncly
        </Link>
      </main>
    );
  }

  if (!data) {
    return (
      <main>
        <h1>List not found</h1>

        <Link to="/">
          Go to Syncly
        </Link>
      </main>
    );
  }

  const activeItems = data.items.filter(
    (item) => !item.completed
  );

  const completedItems = data.items.filter(
    (item) => item.completed
  );

  const handleAcceptInvite = async () => {
    if (!token) return;

    const listId =
      await acceptInvite(token);

    if (listId) {
      navigate(`/lists/${listId}`);
    }
  };

  return (
    <main>
      <header>
        <h1>{data.list.name}</h1>

        <p>
          You are viewing a shared Syncly list.
        </p>
      </header>

      <section>
        <h2>Items</h2>

        {data.items.length === 0 ? (
          <p>This list has no items yet.</p>
        ) : (
          <>
            {activeItems.length > 0 && (
              <ul>
                {activeItems.map((item) => (
                  <li key={item.id}>
                    {item.name}

                    {item.quantity && (
                      <span>
                        {" "}
                        — {item.quantity}
                      </span>
                    )}

                    {item.category && (
                      <span>
                        {" "}
                        ({item.category})
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}

            {completedItems.length > 0 && (
              <section>
                <h3>
                  Completed (
                  {completedItems.length})
                </h3>

                <ul>
                  {completedItems.map(
                    (item) => (
                      <li key={item.id}>
                        {item.name}

                        {item.quantity && (
                          <span>
                            {" "}
                            — {item.quantity}
                          </span>
                        )}
                      </li>
                    )
                  )}
                </ul>
              </section>
            )}
          </>
        )}
      </section>

      <section>
        {user ? (
          <div>
    {data.is_member ? (
      <>
        <h2>You are already a member</h2>

        <p>
          You already have access to this
          list.
        </p>

        <button
          type="button"
          onClick={() =>
            navigate(`/lists/${data.list.id}`)
          }
        >
          Open List
        </button>
      </>
    ) : (
      <>
        <h2>Join this list</h2>

        <p>
          Accept the invite to start
          collaborating on this list.
        </p>

        <button
          type="button"
          onClick={handleAcceptInvite}
          disabled={accepting}
        >
          {accepting
            ? "Joining..."
            : "Join List"}
        </button>

        {acceptError && (
          <p>{acceptError}</p>
        )}
      </>
    )}
  </div>
        ) : (
          <div>
            <h2>Want to collaborate?</h2>

            <p>
              Create an account or log in to
              join this list.
            </p>

            <Link
              to={`/signup?redirect=/invite/${token}`}
            >
              Sign Up
            </Link>

            {" "}

            <Link
              to={`/login?redirect=/invite/${token}`}
            >
              Log In
            </Link>
          </div>
        )}
      </section>
    </main>
  );
};

export default InvitePage;