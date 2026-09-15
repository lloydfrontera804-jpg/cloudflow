'use client';

import React, { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

// useSearchParams requires a Suspense boundary in the App Router, or the
// build fails with "useSearchParams() should be wrapped in a suspense
// boundary" — wrapping here up front avoids hitting that as a build error
// later.
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-950" />}>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const body = await res.json();
      if (!res.ok) {
        setError(body.error || 'Could not reset password.');
        return;
      }
      setSuccess(true);
      setTimeout(() => router.push('/'), 2000);
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-4">
        <p className="text-rose-400">No reset token found in the link. Request a new one from the sign-in bar.</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-4">
        <p className="text-emerald-400">Password updated. Redirecting you to sign in…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h1 className="text-lg font-bold text-white">Set a new password</h1>
        <input
          type="password"
          required
          minLength={8}
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 rounded bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500"
        />
        <input
          type="password"
          required
          minLength={8}
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full px-3 py-2 rounded bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500"
        />
        {error && <p className="text-sm text-rose-400">{error}</p>}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2 rounded bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold cursor-pointer"
        >
          Set new password
        </button>
      </form>
    </div>
  );
}
