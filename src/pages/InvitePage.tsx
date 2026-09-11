import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

const InvitePage = () => {
  const { token } = useParams();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const acceptInvite = async () => {
      if (authLoading || !user || !token) {
        return;
      }

      try {
        setAccepting(true);
        setError("");

        const { data: listId, error } = await supabase.rpc(
          "accept_list_invite",
          {
            p_token: token,
          }
        );

        if (error) {
          console.error("Accept invite error:", error);
          setError(error.message);
          return;
        }

        navigate(`/lists/${listId}`, { replace: true });
      } catch (error) {
        console.error("Unexpected error:", error);
        setError("Something went wrong. Please try again.");
      } finally {
        setAccepting(false);
      }
    };

    acceptInvite();
  }, [authLoading, user, token, navigate]);

  if (authLoading) {
    return <p>Loading...</p>;
  }

  if (!token) {
    return (
      <main>
        <h1>Invalid invite</h1>
        <p>This invite link is missing its token.</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main>
        <h1>You've been invited to a Syncly list</h1>

        <p>
          Log in or create an account to accept this invitation.
        </p>

        <div>
          <Link to={`/login?redirect=/invite/${token}`}>
            Login
          </Link>

          {" "}

          <Link to={`/signup?redirect=/invite/${token}`}>
            Create Account
          </Link>
        </div>
      </main>
    );
  }

  if (accepting) {
    return (
      <main>
        <h1>Joining list...</h1>
        <p>Please wait while we accept your invitation.</p>
      </main>
    );
  }

  if (error) {
    return (
      <main>
        <h1>Unable to join list</h1>
        <p>{error}</p>

        <Link to="/">Go to Syncly</Link>
      </main>
    );
  }

  return null;
};

export default InvitePage;