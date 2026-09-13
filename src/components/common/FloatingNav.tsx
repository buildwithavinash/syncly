import type { MouseEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { Plus, List } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const FloatingNav = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const guardClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!user) {
      event.preventDefault();
      navigate("/login");
    }
  };

  const isCreateActive = location.pathname === "/create-list";
  const isListsActive = location.pathname === "/lists";

  return (
    <nav
      aria-label="Quick actions"
      className="fixed bottom-5 left-1/2 z-40 flex -translate-x-1/2 items-center gap-1 rounded-full border border-border bg-bg/95 p-1.5 backdrop-blur"
    >
      <Link
        to={user ? "/create-list" : "/login"}
        onClick={guardClick}
        aria-label="Create new list"
        className={`flex h-11 w-11 items-center justify-center rounded-full transition-colors ${
          isCreateActive ? "bg-accent text-white" : "text-ink hover:bg-surface"
        }`}
      >
        <Plus className="h-5 w-5" />
      </Link>

      <Link
        to={user ? "/lists" : "/login"}
        onClick={guardClick}
        aria-label="My lists"
        className={`flex h-11 w-11 items-center justify-center rounded-full transition-colors ${
          isListsActive ? "bg-accent text-white" : "text-ink hover:bg-surface"
        }`}
      >
        <List className="h-5 w-5" />
      </Link>
    </nav>
  );
};

export default FloatingNav;