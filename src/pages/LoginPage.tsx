import { useState, type SubmitEvent } from "react";
import { useLocation, useNavigate } from "react-router";
import { supabase } from "../lib/supabase";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
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

      const searchParams = new URLSearchParams(location.search);
      const redirectPath = searchParams.get("redirect");

      if (redirectPath) {
        navigate(redirectPath, { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
      <h1>Welcome back to Syncly</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email</label>

          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
          />
        </div>

        <div>
          <label htmlFor="password">Password</label>

          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
            autoComplete="current-password"
          />
        </div>

        {error && <p>{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </main>
  );
};

export default LoginPage;