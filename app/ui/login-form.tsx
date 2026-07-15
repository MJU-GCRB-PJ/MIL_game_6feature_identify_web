"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const response = await fetch("/api/auth", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code }),
    });

    setIsSubmitting(false);

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(body?.error ?? "Authorization failed.");
      return;
    }

    router.refresh();
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <label className="field-label" htmlFor="auth-code">
        Authorization code
      </label>
      <input
        id="auth-code"
        className="code-input"
        type="password"
        autoComplete="current-password"
        value={code}
        onChange={(event) => setCode(event.target.value)}
        autoFocus
      />
      <button className="primary-button" disabled={isSubmitting || !code.trim()} type="submit">
        <LogIn size={18} />
        {isSubmitting ? "Checking" : "Continue"}
      </button>
      <p className="error" role="alert">
        {error}
      </p>
    </form>
  );
}
