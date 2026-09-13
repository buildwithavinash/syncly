import { Link, useNavigate, useParams } from "react-router";
import { ArrowLeft, Users, Check } from "lucide-react";
import Loader from "../components/common/Loader";
import { formatDisplayText } from "../lib/formatters";
import { useAuth } from "../context/AuthContext";
import { usePublicList } from "../hooks/usePublicList";
import { useAcceptInvite } from "../hooks/useAcceptInvite";
import { useToast } from "../context/ToastContext";

const BackButton = ({ to }: { to: string }) => (
  <Link
    to={to}
    aria-label="Back to Cartify"
    className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-border text-ink transition-colors hover:border-border-strong hover:bg-surface sm:left-6 sm:top-6"
  >
    <ArrowLeft className="h-4 w-4" />
  </Link>
);

const InvitePage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const { data, loading, error } = usePublicList(token);
  const { accepting, error: acceptError, acceptInvite } = useAcceptInvite();

  if (loading) {
    return (
      <main className="relative min-h-screen px-gutter py-12">
        <BackButton to="/" />
        <div className="mx-auto max-w-sm pt-14 text-center">
          <Loader label="Loading shared list..." centered />
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="relative min-h-screen px-gutter py-12">
        <BackButton to="/" />
        <div className="mx-auto max-w-sm pt-14 text-center">
          <h1 className="font-display text-xl text-ink">
            Unable to open list
          </h1>
          <p className="mt-2 text-sm text-slate">{error}</p>

          <Link
            to="/"
            className="mt-5 inline-block rounded-md border border-border px-4 py-2 text-sm text-ink transition-colors hover:border-border-strong"
          >
            Go to Cartify
          </Link>
        </div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="relative min-h-screen px-gutter py-12">
        <BackButton to="/" />
        <div className="mx-auto max-w-sm pt-14 text-center">
          <h1 className="font-display text-xl text-ink">List not found</h1>

          <Link
            to="/"
            className="mt-5 inline-block rounded-md border border-border px-4 py-2 text-sm text-ink transition-colors hover:border-border-strong"
          >
            Go to Cartify
          </Link>
        </div>
      </main>
    );
  }

  const activeItems = data.items.filter((item) => !item.completed);
  const completedItems = data.items.filter((item) => item.completed);

  const handleAcceptInvite = async () => {
    if (!token) return;

    const listId = await acceptInvite(token);

    if (listId) {
      showToast("You've joined the list");
      navigate(`/lists/${listId}`);
    }
  };

  return (
    <main className="relative min-h-screen px-gutter py-12">
      <BackButton to="/" />

      <div className="mx-auto max-w-2xl pt-14">
        <div className="mb-8 border-b border-border pb-6">
          <p className="mb-1 text-sm font-medium text-accent">
            Shared list
          </p>
          <h1 className="font-display text-2xl text-ink sm:text-3xl">
            {formatDisplayText(data.list.name)}
          </h1>
        </div>

        <section className="mb-8">
          <h2 className="mb-3 text-sm font-medium text-ink">Items</h2>

          {data.items.length === 0 ? (
            <p className="text-sm text-slate">This list has no items yet.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {activeItems.length > 0 && (
                <div className="flex flex-col divide-y divide-border rounded-lg border border-border">
                  {activeItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 px-4 py-3">
                      <span className="h-4 w-4 shrink-0 rounded border border-border-strong" />
                      <span className="text-sm text-ink">
                        {formatDisplayText(item.name)}
                        {item.quantity && (
                          <span className="text-slate"> — {item.quantity}</span>
                        )}
                        {item.category && (
                          <span className="text-slate"> ({formatDisplayText(item.category)})</span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {completedItems.length > 0 && (
                <div>
                  <p className="mb-2 text-xs text-slate">
                    Completed ({completedItems.length})
                  </p>
                  <div className="flex flex-col divide-y divide-border rounded-lg border border-border">
                    {completedItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 px-4 py-3">
                        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded bg-accent">
                          <Check className="h-3 w-3 text-white" />
                        </span>
                        <span className="text-sm text-slate line-through">
                          {formatDisplayText(item.name)}
                          {item.quantity && <span> — {item.quantity}</span>}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        <section className="rounded-lg border border-border p-5">
          {user ? (
            data.is_member ? (
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="font-display text-lg text-ink">
                    You're already a member
                  </h2>
                  <p className="mt-1 text-sm text-slate">
                    You already have access to this list.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => navigate(`/lists/${data.list.id}`)}
                  className="shrink-0 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
                >
                  Open list
                </button>
              </div>
            ) : (
              <div>
                <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-full bg-accent-tint">
                  <Users className="h-4 w-4 text-accent-ink" />
                </div>

                <h2 className="font-display text-lg text-ink">
                  Join this list
                </h2>
                <p className="mt-1 text-sm text-slate">
                  Accept the invite to start collaborating.
                </p>

                {acceptError && (
                  <p className="mt-3 rounded-md bg-danger-tint px-3 py-2 text-sm text-danger">
                    {acceptError}
                  </p>
                )}

                <button
                  type="button"
                  onClick={handleAcceptInvite}
                  disabled={accepting}
                  className="mt-4 rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                >
                  {accepting ? "Joining..." : "Join list"}
                </button>
              </div>
            )
          ) : (
            <div>
              <h2 className="font-display text-lg text-ink">
                Want to collaborate?
              </h2>
              <p className="mt-1 text-sm text-slate">
                Create an account or log in to join this list.
              </p>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <Link
                  to={`/signup?redirect=/invite/${token}`}
                  className="inline-flex items-center justify-center rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
                >
                  Sign up
                </Link>

                <Link
                  to={`/login?redirect=/invite/${token}`}
                  className="inline-flex items-center justify-center rounded-md border border-border px-5 py-2.5 text-sm text-ink transition-colors hover:border-border-strong"
                >
                  Log in
                </Link>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default InvitePage;