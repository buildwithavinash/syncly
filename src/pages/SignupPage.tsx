import { useState, type SubmitEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import {
  ArrowLeft,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  MailCheck,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { useToast } from "../context/ToastContext";

const SignupPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [awaitingVerification, setAwaitingVerification] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Enter your name.");
      return;
    }

    if (!email.trim()) {
      setError("Enter your email.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    try {
      setLoading(true);

      const redirectPath = new URLSearchParams(location.search).get(
        "redirect"
      );

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            name: name.trim(),
          },
        },
      });

      if (error) {
        setError(error.message);
        return;
      }

      if (data.session) {
        showToast("Account created");
        navigate(redirectPath || "/", { replace: true });
        return;
      }

      setAwaitingVerification(true);
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };



  if (awaitingVerification) {
    return (
      <main className="relative min-h-screen px-gutter py-12">
        <Link
        to="/"
        aria-label="Back to Cartify"
        className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-border text-ink transition-colors hover:border-border-strong hover:bg-surface sm:left-6 sm:top-6"
      >
        <ArrowLeft className="h-4 w-4" />
      </Link>

        <div className="mx-auto flex max-w-sm flex-col justify-center pt-14 text-center">
          <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-accent-tint">
            <MailCheck className="h-5 w-5 text-accent-ink" />
          </div>

          <h1 className="font-display text-2xl text-ink">Check your email</h1>
          <p className="mt-2 text-sm leading-relaxed text-slate">
            We sent a verification link to{" "}
            <strong className="font-medium text-ink">{email.trim()}</strong>.
            {location.search.includes("redirect")
              ? " After verifying, open your invite link again to join the list."
              : " Verify your email, then log in to get started."}
          </p>

          <Link
            to={`/login${location.search}`}
            className="mt-6 inline-flex items-center justify-center gap-1.5 rounded-md border border-border py-2.5 text-sm text-ink transition-colors hover:border-border-strong"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to log in
          </Link>
        </div>
      </main>
    );
  }

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
        <h1 className="font-display text-2xl text-ink">Create your account</h1>
        <p className="mt-1.5 text-sm text-slate">
          Start a list in less than a minute.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 flex flex-col gap-4"
          noValidate
        >
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm text-ink">
              Name
            </label>

            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate" />

              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                autoComplete="name"
                className="w-full rounded-md border border-border bg-bg py-2.5 pl-10 pr-3 text-sm text-ink placeholder:text-slate/70 transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
            </div>
          </div>

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
                placeholder="At least 6 characters"
                autoComplete="new-password"
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

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-1.5 block text-sm text-ink"
            >
              Confirm password
            </label>

            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate" />

              <input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                autoComplete="new-password"
                className="w-full rounded-md border border-border bg-bg py-2.5 pl-10 pr-3 text-sm text-ink placeholder:text-slate/70 transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
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
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate">
          Already have an account?{" "}
          <Link
            to={`/login${location.search}`}
            className="text-accent hover:underline"
          >
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
};

export default SignupPage;