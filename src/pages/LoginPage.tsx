import { useState, type SubmitEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useToast } from "../context/ToastContext";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Enter your email.");
      return;
    }

    if (!password) {
      setError("Enter your password.");
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setError(error.message);
        return;
      }

      const redirectPath = new URLSearchParams(location.search).get(
        "redirect"
      );

      showToast("Welcome back");
      navigate(redirectPath || "/", { replace: true });
    } catch (err) {
      console.error("Login error:", err);
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen px-gutter py-12">
      <Link
        to="/"
        aria-label="Back to Cartify"
        className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-border text-ink transition-colors hover:border-border-strong hover:bg-surface sm:left-6 sm:top-6"
      >
        <ArrowLeft className="h-4 w-4" />
      </Link>

      <div className="mx-auto flex max-w-sm flex-col justify-center pt-14">
        <h1 className="font-display text-2xl text-ink">Welcome back</h1>
        <p className="mt-1.5 text-sm text-slate">Log in to see your lists.</p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 flex flex-col gap-4"
          noValidate
        >
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm text-ink">
              Email
            </label>

            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate" />

              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                className="w-full rounded-md border border-border bg-bg py-2.5 pl-10 pr-3 text-sm text-ink placeholder:text-slate/70 transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm text-ink"
            >
              Password
            </label>

            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate" />

              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                autoComplete="current-password"
                className="w-full rounded-md border border-border bg-bg py-2.5 pl-10 pr-10 text-sm text-ink placeholder:text-slate/70 transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
              />

              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate transition-colors hover:text-ink"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <p className="rounded-md bg-danger-tint px-3 py-2 text-sm text-danger">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-md bg-accent py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate">
          New to Cartify?{" "}
          <Link
            to={`/signup${location.search}`}
            className="text-accent hover:underline"
          >
            Create an account
          </Link>
        </p>
      </div>
    </main>
  );
};

export default LoginPage;