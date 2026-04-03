import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { FormEvent, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { authApi } from "../api/authApi";
import { useAuth } from "../hooks/useAuth";

const demoCredentials = [
  { role: "ADMIN", email: "admin@finance.local", password: "Admin@123" },
  { role: "ANALYST", email: "analyst@finance.local", password: "Analyst@123" },
  { role: "VIEWER", email: "viewer@finance.local", password: "Viewer@123" }
] as const;

export const LoginPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (payload) => {
      login(payload);
      navigate("/dashboard");
    },
    onError: (mutationError) => {
      if (isAxiosError<{ message?: string }>(mutationError)) {
        setError(mutationError.response?.data?.message || "Login failed.");
      } else {
        setError("Login failed.");
      }
    }
  });

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    loginMutation.mutate({ email, password });
  };

  const handleDemoFill = (credential: (typeof demoCredentials)[number]) => {
    setEmail(credential.email);
    setPassword(credential.password);
    setError(null);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-100 to-slate-100 p-4">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Welcome Back</h1>
        <p className="mt-1 text-sm text-slate-600">Login to continue to your finance dashboard.</p>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
          <label className="grid gap-1 text-sm">
            <span className="font-medium text-slate-700">Email</span>
            <input
              type="email"
              required
              className="rounded-md border border-slate-300 px-3 py-2"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>

          <label className="grid gap-1 text-sm">
            <span className="font-medium text-slate-700">Password</span>
            <input
              type="password"
              required
              className="rounded-md border border-slate-300 px-3 py-2"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loginMutation.isPending ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-900">Demo credentials</p>
          <div className="mt-2 grid gap-2">
            {demoCredentials.map((credential) => (
              <button
                key={credential.role}
                type="button"
                onClick={() => handleDemoFill(credential)}
                className="grid gap-1 rounded-md border border-amber-200 bg-white px-3 py-2 text-left text-xs text-slate-700 hover:bg-amber-100"
              >
                <span className="font-semibold text-slate-900">{credential.role}</span>
                <span>{credential.email}</span>
                <span className="font-mono text-slate-600">{credential.password}</span>
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-amber-800">Click any credential to auto-fill email and password.</p>
        </div>

        <p className="mt-4 text-sm text-slate-600">
          No account?{" "}
          <Link to="/register" className="font-semibold text-brand-700 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};
