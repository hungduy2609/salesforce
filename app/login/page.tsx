"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("duy@example.com");
  const [password, setPassword] = useState("demo-password");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    setIsSubmitting(false);

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(body?.error ?? "Unable to sign in");
      return;
    }

    router.push("/app/home");
    router.refresh();
  }

  return (
    <main className="login-page" data-testid="page-login">
      <form className="login-card" data-testid="login-widget" onSubmit={handleSubmit}>
        <div className="login-mark" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
        </div>
        <p className="eyebrow">CRM Demo</p>
        <h1>Sign in to the Lightning workspace</h1>
        <p className="login-copy">
          Real database-backed authentication with Salesforce-style role permissions for CRM access.
        </p>
        <label>
          Email
          <input
            data-testid="input-login-email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            autoComplete="email"
            required
          />
        </label>
        <label>
          Password
          <input
            data-testid="input-login-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            autoComplete="current-password"
            required
          />
        </label>
        {error ? <p className="form-error" role="alert">{error}</p> : null}
        <button className="button primary full" data-testid="btn-login" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Logging in..." : "Log in"}
        </button>
        <p className="login-hint">Seed users: duy@example.com, manager@example.com, admin@example.com, readonly@example.com. Password: demo-password.</p>
      </form>
    </main>
  );
}
