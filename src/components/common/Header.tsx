import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router";
import { Menu, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import { useToast } from "../../context/ToastContext";
import ConfirmModal from "./ConfirmModal";

const Header = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  const handleConfirmLogout = async () => {
    try {
      setLoggingOut(true);

      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Logout error:", error);
        showToast("Couldn't log you out. Try again.", "error");
        return;
      }

      setConfirmOpen(false);
      closeMenu();
      navigate("/");
      showToast("Logged out");
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/90 backdrop-blur">
      <div className="mx-auto flex max-w-container items-center justify-between px-gutter py-4">
        <Link
          to="/"
          className="font-display text-xl italic text-ink"
          onClick={closeMenu}
        >
          Cartify
        </Link>

        {loading ? (
          <span className="text-sm text-slate">Loading...</span>
        ) : user ? (
          <>
            <nav className="hidden items-center gap-6 sm:flex">
              <Link
                to="/lists"
                className="text-sm text-slate transition-colors hover:text-ink"
              >
                My lists
              </Link>

              <Link
                to="/create-list"
                className="text-sm text-slate transition-colors hover:text-ink"
              >
                Create list
              </Link>

              <button
                type="button"
                onClick={() => setConfirmOpen(true)}
                className="rounded-md border border-border px-3 py-1.5 text-sm text-ink transition-colors hover:border-border-strong"
              >
                Log out
              </button>
            </nav>

            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="rounded-md p-1.5 text-ink sm:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </>
        ) : (
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-sm text-slate transition-colors hover:text-ink"
            >
              Log in
            </Link>

            <Link
              to="/signup"
              className="rounded-md bg-accent px-4 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              Get started
            </Link>
          </div>
        )}
      </div>

      {user &&
        createPortal(
          <div
            className={`fixed inset-0 z-[100] overflow-hidden sm:hidden ${
              menuOpen ? "" : "pointer-events-none"
            }`}
          >
            <div
              onClick={closeMenu}
              className={`absolute inset-0 bg-ink/45 transition-opacity duration-300 ${
                menuOpen ? "opacity-100" : "opacity-0"
              }`}
            />

            <div
              className={`absolute right-0 top-0 flex h-full w-72 max-w-[80%] flex-col border-l border-border bg-bg p-5 shadow-xl transition-transform duration-300 ease-out ${
                menuOpen ? "translate-x-0" : "translate-x-full"
              }`}
            >
              <div className="mb-6 flex items-center justify-between">
                <span className="font-display text-lg italic text-ink">
                  Cartify
                </span>

                <button
                  type="button"
                  onClick={closeMenu}
                  className="rounded-full p-1 text-slate transition-colors hover:text-ink"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="flex flex-col gap-1">
                <Link
                  to="/lists"
                  onClick={closeMenu}
                  className="rounded-md px-3 py-2.5 text-sm text-ink transition-colors hover:bg-surface"
                >
                  My lists
                </Link>

                <Link
                  to="/create-list"
                  onClick={closeMenu}
                  className="rounded-md px-3 py-2.5 text-sm text-ink transition-colors hover:bg-surface"
                >
                  Create list
                </Link>
              </nav>

              <button
                type="button"
                onClick={() => setConfirmOpen(true)}
                className="mt-auto rounded-md border border-border py-2.5 text-sm text-danger transition-colors hover:bg-danger-tint"
              >
                Log out
              </button>
            </div>
          </div>,
          document.body
        )}

      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmLogout}
        title="Log out of Cartify?"
        description="You'll need to log back in to see your lists."
        confirmLabel="Log out"
        confirming={loggingOut}
      />
    </header>
  );
};

export default Header;