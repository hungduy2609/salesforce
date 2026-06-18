"use client";

import { useTranslations } from "next-intl";
import { FormEvent, useState } from "react";
import { useRouter } from "@/i18n/navigation";

export default function LoginPage() {
  const router = useRouter();
  const t = useTranslations("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      setError(body?.error ?? t("error"));
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
        <p className="eyebrow">{t("eyebrow")}</p>
        <h1>{t("title")}</h1>
        <p className="login-copy">{t("copy")}</p>
        <label>
          {t("email")}
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
          {t("password")}
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
          {isSubmitting ? t("submitting") : t("submit")}
        </button>
        <p className="login-hint">{t("hint")}</p>
      </form>
    </main>
  );
}
