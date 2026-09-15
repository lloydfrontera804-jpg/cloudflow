'use client';

import React, { useState } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';
import { LogOut, AlertCircle } from 'lucide-react';

export function EmailAuthBar({ highlight }: { highlight?: boolean }) {
  const { data: session, status } = useSession();
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSignedIn = status === 'authenticated' && !!session?.user?.email;

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const body = await res.json();
      // Always shows the same message regardless of whether the account
      // exists — matches the backend's intentional non-disclosure.
      setInfoMessage(body.message || 'If that email has an account, a reset link has been sent.');
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);

    if (mode === 'forgot') return handleForgotPassword(e);

    setIsSubmitting(true);

    try {
      if (mode === 'signup') {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name }),
        });
        const body = await res.json();
        if (!res.ok) {
          setError(body.error || 'Could not create account.');
          setIsSubmitting(false);
          return;
        }
        // Registration succeeded — immediately sign them in with the same credentials.
      }

      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Incorrect email or password, or this email is not authorized.');
      } else {
        setEmail('');
        setPassword('');
        setName('');
      }
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="w-full bg-zinc-900 border-b border-zinc-800 px-4 py-1.5 text-xs text-zinc-500 text-right">
        Checking sign-in…
      </div>
    );
  }

  if (isSignedIn) {
    return (
      <div className="w-full bg-zinc-900 border-b border-zinc-800 px-4 py-1.5 flex items-center justify-end gap-3 text-xs text-zinc-300">
        <span>
          Signed in as <span className="font-semibold text-white">{session.user.email}</span>
        </span>
        <button
          onClick={() => signOut()}
          className="flex items-center gap-1 px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 cursor-pointer"
        >
          <LogOut className="w-3 h-3" />
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div
      className={`w-full bg-zinc-900 border-b px-4 py-2 transition-all ${
        highlight ? 'border-amber-500 ring-1 ring-amber-500/50' : 'border-zinc-800'
      }`}
    >
      <form onSubmit={handleSubmit} className="flex flex-wrap items-center justify-end gap-2 text-xs">
        {mode === 'signup' && (
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="px-2 py-1 rounded bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 w-28"
          />
        )}
        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="px-2 py-1 rounded bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 w-44"
        />
        {mode !== 'forgot' && (
          <input
            type="password"
            required
            minLength={8}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="px-2 py-1 rounded bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 w-32"
          />
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold cursor-pointer"
        >
          {mode === 'signin' ? 'Sign in' : mode === 'signup' ? 'Create account' : 'Send reset link'}
        </button>
        <button
          type="button"
          onClick={() => {
            setMode(mode === 'signin' ? 'signup' : 'signin');
            setError(null);
            setInfoMessage(null);
          }}
          className="text-zinc-400 hover:text-white underline cursor-pointer"
        >
          {mode === 'signin' ? 'Need an account?' : 'Have an account? Sign in'}
        </button>
        {mode !== 'forgot' && (
          <button
            type="button"
            onClick={() => {
              setMode('forgot');
              setError(null);
              setInfoMessage(null);
            }}
            className="text-zinc-400 hover:text-white underline cursor-pointer"
          >
            Forgot password?
          </button>
        )}
      </form>
      {error && (
        <div className="flex items-center gap-1 text-[11px] text-rose-400 mt-1 justify-end">
          <AlertCircle className="w-3 h-3" />
          {error}
        </div>
      )}
      {infoMessage && <div className="text-[11px] text-emerald-400 mt-1 text-right">{infoMessage}</div>}
    </div>
  );
}
