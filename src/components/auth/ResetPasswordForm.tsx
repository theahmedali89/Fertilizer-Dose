"use client";

import { useState } from "react";
import { Card, CardBody } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/fields";

export function ResetPasswordForm() {
  const [email, setEmail] = useState("");
  const [secret, setSecret] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          secret,
          newPassword,
        }),
      });
      const data = await res.json();
      setBusy(false);
      if (!data.ok) {
        setError(data.message || "Reset failed.");
        return;
      }
      setSuccess(true);
    } catch {
      setBusy(false);
      setError("Network error. Try again.");
    }
  };

  if (success) {
    return (
      <Card className="max-w-md mx-auto">
        <CardBody>
          <h1 className="font-display text-3xl font-semibold">Password Reset</h1>
          <p className="text-sm mt-4 text-green-700 dark:text-green-400">
            Password updated successfully. You can now log in with your new password.
          </p>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardBody>
        <h1 className="font-display text-3xl font-semibold">Reset Password</h1>
        <p className="text-sm text-ink-soft mt-1.5 mb-6">
          Enter your email, the reset secret (from Vercel env vars), and a new password.
        </p>
        <form onSubmit={onSubmit} className="space-y-4">
          <Field label="Email">
            <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          </Field>
          <Field label="Reset Secret">
            <Input type="password" required value={secret} onChange={(e) => setSecret(e.target.value)} autoComplete="off" placeholder="PASSWORD_RESET_SECRET" />
          </Field>
          <Field label="New Password">
            <Input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} autoComplete="new-password" minLength={8} />
          </Field>
          <Field label="Confirm Password">
            <Input type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" minLength={8} />
          </Field>
          {error && (
            <p role="alert" className="text-sm font-medium text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl px-4 py-2.5">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-xl bg-leaf-700 dark:bg-leaf-600 px-5 py-3 font-semibold text-white hover:bg-leaf-800 dark:hover:bg-leaf-500 transition-colors disabled:opacity-60"
          >
            {busy ? "…" : "Reset Password"}
          </button>
        </form>
      </CardBody>
    </Card>
  );
}
