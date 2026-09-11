import { Link, useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";

const Header = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout error:", error);
      return;
    }

    navigate("/");
  };

  return (
    <header className="flex justify-between px-4 py-2">
      <Link to="/" className="text-slate-900">
        Syncly
      </Link>

      <div className="flex gap-4">
        {loading ? (
          <span>Loading...</span>
        ) : user ? (
          <>
  <Link to="/lists">My Lists</Link>
  <Link to="/create-list">Create List</Link>
  <button type="button" onClick={handleLogout}>
    Logout
  </button>
</>
        ) : (
          <>
            <Link to="/login">Login</Link>

            <Link to="/signup">Get Started</Link>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;